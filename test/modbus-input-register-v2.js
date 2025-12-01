// --- Modbus Input Register Driver (Multiple Instances) ---

const metadata = {
  name: 'Modbus Input Register',
  version: '2.0.0',
  description: 'Driver para leitura de Input Register (sensor analógico) via Modbus TCP.',
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
    description: 'Endereço do input register Modbus (0-65535)',
  },
  pollingInterval: {
    name: 'Polling Interval (ms)',
    type: 'number',
    required: true,
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
    description: 'Rótulo descritivo (ex: "Temperatura Forno", "Vazão Entrada")',
  },
  unit: {
    name: 'Unit',
    type: 'string',
    default: '',
    description: 'Unidade de medida (ex: "°C", "L/min", "bar")',
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
    description: 'Valor mínimo esperado (para alarmes)',
  },
  maxValue: {
    name: 'Max Value',
    type: 'number',
    default: null,
    description: 'Valor máximo esperado (para alarmes)',
  },
};

export const onInit = async (system, config) => {
  system.log(`[${metadata.name}] Inicializando sensor "${config.label || config.address}"...`);
  system.log(`[${metadata.name}] Unidade: ${config.unit}, Scale: ${config.scale}, Offset: ${config.offset}`);

  // ✅ Estado da instância (via closure)
  let value = 0;
  let requestCounter = 0;
  let pollingTimer = null;
  let isConnected = false;
  let bidding = system.bidding.createSlave(config.biddingChannel);

  const getRequestId = () => {
    requestCounter++;
    return `input-register-${config.address}-${requestCounter}-${Date.now()}`;
  };

  const applyScale = (rawValue) => {
    let scaledValue = rawValue * config.scale + config.offset;
    return Number(scaledValue.toFixed(config.decimals));
  };

  const checkAlarms = (val) => {
    const alarms = [];

    if (config.minValue !== null && val < config.minValue) {
      alarms.push({
        type: 'low',
        message: `Valor abaixo do mínimo (${val} < ${config.minValue})`,
        severity: 'warning',
      });
    }

    if (config.maxValue !== null && val > config.maxValue) {
      alarms.push({
        type: 'high',
        message: `Valor acima do máximo (${val} > ${config.maxValue})`,
        severity: 'warning',
      });
    }

    return alarms;
  };

  const readRegister = () => {
    bidding.emit('read-input-registers', {
      address: config.address,
      quantity: 1,
      requestId: getRequestId(),
    });
  };

  // === Event Handlers ===

  bidding.on('connection-status', (data) => {
    isConnected = data.status === 'connected';
    system.log(`[${metadata.name}] Modbus ${data.status}`);

    bidding.emit('input-register-status', {
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

  bidding.on('read-input-registers-response', (response) => {
    if (response.success && response.address === config.address) {
      let rawValue = response.values[0];

      if (config.signed && rawValue > 32767) {
        rawValue = rawValue - 65536;
      }

      const newValue = applyScale(rawValue);
      const alarms = checkAlarms(newValue);

      if (newValue !== value) {
        const oldValue = value;
        value = newValue;
        const delta = value - oldValue;

        system.log(`[${metadata.name}] Valor mudou: ${oldValue} → ${value} ${config.unit} (Δ=${delta})`);

        bidding.emit('input-register-changed', {
          address: config.address,
          label: config.label,
          oldValue,
          newValue: value,
          delta,
          unit: config.unit,
          rawValue,
          alarms,
          timestamp: Date.now(),
        });
      }

      if (alarms.length > 0) {
        bidding.emit('input-register-alarm', {
          address: config.address,
          label: config.label,
          value,
          alarms,
          timestamp: Date.now(),
        });
      }

      bidding.emit('input-register-value', {
        address: config.address,
        label: config.label,
        value,
        rawValue,
        unit: config.unit,
        alarms,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao ler:`, response.error);
      bidding.emit('input-register-error', {
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  system.log(`[${metadata.name}] Driver inicializado (SOMENTE LEITURA)`);
  bidding.emit('input-register-status', {
    event: 'initialized',
    address: config.address,
    label: config.label,
    unit: config.unit,
    timestamp: Date.now(),
  });

  // ✅ Retorna API pública da instância
  return {
    address: config.address,
    label: config.label,
    unit: config.unit,

    // Estado
    getValue: () => value,
    isConnected: () => isConnected,

    // Comandos
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

      bidding.emit('input-register-status', {
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
