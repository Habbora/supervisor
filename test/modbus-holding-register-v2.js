// --- Modbus Holding Register Driver (Multiple Instances) ---

const metadata = {
  name: 'Modbus Holding Register',
  version: '2.0.0',
  description: 'Driver para controle de Holding Register (setpoint, parâmetro) via Modbus TCP.',
};

export const configSchema = {
  biddingChannel: {
    name: 'Bidding Channel',
    type: 'string',
    required: true,
    default: 'modbus-tcp-events',
    description: 'Canal bidding para conectar ao Modbus TCP Client',
  },
  address: {
    name: 'Register Address',
    type: 'number',
    required: true,
    default: 0,
    description: 'Endereço do holding register Modbus (0-65535)',
  },
  readOnly: {
    name: 'Read Only Mode',
    type: 'boolean',
    default: false,
    description: 'Modo somente leitura (desabilita comandos de escrita)',
  },
  pollingInterval: {
    name: 'Polling Interval (ms)',
    type: 'number',
    default: 1000,
    description: 'Intervalo de polling para leitura (0 = desabilitado)',
  },
  autoRead: {
    name: 'Auto Read on Init',
    type: 'boolean',
    default: true,
    description: 'Ler valor inicial ao conectar',
  },
  label: {
    name: 'Label',
    type: 'string',
    default: '',
    description: 'Rótulo descritivo (ex: "Setpoint Temperatura", "Velocidade Motor")',
  },
  unit: {
    name: 'Unit',
    type: 'string',
    default: '',
    description: 'Unidade de medida (ex: "°C", "RPM", "%")',
  },
  scale: {
    name: 'Scale Factor',
    type: 'number',
    default: 1,
    description: 'Fator de escala (valor_real = valor_raw * scale)',
  },
  offset: {
    name: 'Offset',
    type: 'number',
    default: 0,
    description: 'Offset (valor_real = (valor_raw * scale) + offset)',
  },
  decimals: {
    name: 'Decimal Places',
    type: 'number',
    default: 2,
    description: 'Casas decimais para arredondamento',
  },
  signed: {
    name: 'Signed Value',
    type: 'boolean',
    default: false,
    description: 'Interpretar como número com sinal (int16 vs uint16)',
  },
  minValue: {
    name: 'Min Value',
    type: 'number',
    default: null,
    description: 'Valor mínimo permitido (validação)',
  },
  maxValue: {
    name: 'Max Value',
    type: 'number',
    default: null,
    description: 'Valor máximo permitido (validação)',
  },
};

export const onInit = async (system, config) => {
  system.log(`[${metadata.name}] Inicializando "${config.label || config.address}"...`);
  system.log(`[${metadata.name}] Modo: ${config.readOnly ? 'SOMENTE LEITURA' : 'LEITURA/ESCRITA'}`);
  system.log(`[${metadata.name}] Unidade: ${config.unit}, Scale: ${config.scale}, Offset: ${config.offset}`);

  // ✅ Estado da instância (via closure)
  let value = 0;
  let requestCounter = 0;
  let pollingTimer = null;
  let isConnected = false;
  let bidding = system.bidding.createSlave(config.biddingChannel);

  const getRequestId = () => {
    requestCounter++;
    return `holding-register-${config.address}-${requestCounter}-${Date.now()}`;
  };

  const applyScale = (rawValue) => {
    let scaledValue = rawValue * config.scale + config.offset;
    return Number(scaledValue.toFixed(config.decimals));
  };

  const reverseScale = (scaledValue) => {
    let rawValue = (scaledValue - config.offset) / config.scale;
    return Math.round(rawValue);
  };

  const validateValue = (val) => {
    if (config.minValue !== null && val < config.minValue) {
      return { valid: false, error: `Valor abaixo do mínimo permitido (${val} < ${config.minValue})` };
    }

    if (config.maxValue !== null && val > config.maxValue) {
      return { valid: false, error: `Valor acima do máximo permitido (${val} > ${config.maxValue})` };
    }

    return { valid: true };
  };

  const readRegister = () => {
    bidding.emit('read-holding-registers', {
      address: config.address,
      quantity: 1,
      requestId: getRequestId(),
    });
  };

  // === Event Handlers ===

  bidding.on('connection-status', (data) => {
    isConnected = data.status === 'connected';
    system.log(`[${metadata.name}] Modbus ${data.status}`);

    bidding.emit('holding-register-status', {
      event: `modbus-${data.status}`,
      address: config.address,
      label: config.label,
      timestamp: Date.now(),
    });

    if (isConnected) {
      if (config.autoRead) {
        readRegister();
      }

      if (config.pollingInterval > 0 && !pollingTimer) {
        system.log(`[${metadata.name}] Polling a cada ${config.pollingInterval}ms`);
        pollingTimer = setInterval(() => readRegister(), config.pollingInterval);
      }
    } else {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }
  });

  bidding.on('read-holding-registers-response', (response) => {
    if (response.success && response.address === config.address) {
      let rawValue = response.values[0];

      if (config.signed && rawValue > 32767) {
        rawValue = rawValue - 65536;
      }

      const newValue = applyScale(rawValue);

      if (newValue !== value) {
        const oldValue = value;
        value = newValue;
        const delta = value - oldValue;

        system.log(`[${metadata.name}] Valor mudou: ${oldValue} → ${value} ${config.unit} (Δ=${delta})`);

        bidding.emit('holding-register-changed', {
          address: config.address,
          label: config.label,
          oldValue,
          newValue: value,
          delta,
          unit: config.unit,
          rawValue,
          timestamp: Date.now(),
        });
      }

      bidding.emit('holding-register-value', {
        address: config.address,
        label: config.label,
        value,
        rawValue,
        unit: config.unit,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao ler:`, response.error);
      bidding.emit('holding-register-error', {
        operation: 'read',
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  bidding.on('write-single-register-response', (response) => {
    if (response.success && response.address === config.address) {
      let rawValue = response.value;

      if (config.signed && rawValue > 32767) {
        rawValue = rawValue - 65536;
      }

      const newValue = applyScale(rawValue);
      const oldValue = value;
      value = newValue;

      system.log(`[${metadata.name}] Escrita confirmada: ${value} ${config.unit}`);

      if (oldValue !== value) {
        bidding.emit('holding-register-changed', {
          address: config.address,
          label: config.label,
          oldValue,
          newValue: value,
          delta: value - oldValue,
          unit: config.unit,
          rawValue,
          timestamp: Date.now(),
        });
      }

      bidding.emit('holding-register-value', {
        address: config.address,
        label: config.label,
        value,
        rawValue,
        unit: config.unit,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao escrever:`, response.error);
      bidding.emit('holding-register-error', {
        operation: 'write',
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  system.log(`[${metadata.name}] Driver inicializado`);
  bidding.emit('holding-register-status', {
    event: 'initialized',
    address: config.address,
    label: config.label,
    unit: config.unit,
    readOnly: config.readOnly,
    timestamp: Date.now(),
  });

  // ✅ Retorna API pública da instância
  return {
    address: config.address,
    label: config.label,
    unit: config.unit,
    readOnly: config.readOnly,

    // Estado
    getValue: () => value,
    isConnected: () => isConnected,

    // Comandos
    set: (newValue, requestId) => {
      if (config.readOnly) {
        throw new Error('Holding register está em modo somente leitura');
      }

      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }

      const validation = validateValue(newValue);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      let rawValue = reverseScale(newValue);

      if (config.signed) {
        rawValue = Math.max(-32768, Math.min(32767, rawValue));
        if (rawValue < 0) rawValue = 65536 + rawValue;
      } else {
        rawValue = Math.max(0, Math.min(65535, rawValue));
      }

      const reqId = requestId || getRequestId();
      bidding.emit('write-single-register', {
        address: config.address,
        value: rawValue,
        requestId: reqId,
      });

      return reqId;
    },

    increment: (amount = 1, requestId) => {
      if (config.readOnly) {
        throw new Error('Holding register está em modo somente leitura');
      }

      const newValue = value + amount;
      const validation = validateValue(newValue);

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return this.set(newValue, requestId);
    },

    refresh: () => {
      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }
      readRegister();
    },

    // Acesso ao bidding para listeners
    on: (event, handler) => bidding.on(event, handler),
    emit: (event, data) => bidding.emit(event, data),

    // Cleanup
    close: () => {
      system.log(`[${metadata.name}] Finalizando...`);

      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }

      bidding.emit('holding-register-status', {
        event: 'closed',
        timestamp: Date.now(),
      });
    },
  };
};

export const onClose = (instance) => {
  if (instance && instance.close) {
    instance.close();
  }
};

export default { metadata, configSchema, onInit, onClose };
