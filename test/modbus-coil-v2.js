// --- Modbus Coil Driver (Multiple Instances) ---

const metadata = {
  name: 'Modbus Coil',
  version: '2.0.0',
  description: 'Driver para controle de Coil (saída digital ON/OFF) via Modbus TCP.',
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
    name: 'Coil Address',
    type: 'number',
    required: true,
    default: 0,
    description: 'Endereço da coil Modbus (0-65535)',
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
    description: 'Ler estado inicial ao conectar',
  },
  label: {
    name: 'Label',
    type: 'string',
    default: '',
    description: 'Rótulo descritivo para a coil (ex: "Bomba Principal")',
  },
};

export const onInit = async (system, config) => {
  system.log(`[${metadata.name}] Inicializando coil "${config.label || config.address}"...`);
  system.log(`[${metadata.name}] Modo: ${config.readOnly ? 'SOMENTE LEITURA' : 'LEITURA/ESCRITA'}`);

  // ✅ Estado da instância (via closure)
  let state = false;
  let requestCounter = 0;
  let pollingTimer = null;
  let isConnected = false;
  let bidding = system.bidding.createSlave(config.biddingChannel);

  const getRequestId = () => {
    requestCounter++;
    return `coil-${config.address}-${requestCounter}-${Date.now()}`;
  };

  const readCoil = () => {
    bidding.emit('read-coils', {
      address: config.address,
      quantity: 1,
      requestId: getRequestId(),
    });
  };

  // === Event Handlers ===

  bidding.on('connection-status', (data) => {
    isConnected = data.status === 'connected';
    system.log(`[${metadata.name}] Modbus ${data.status}`);

    bidding.emit('coil-status', {
      event: `modbus-${data.status}`,
      address: config.address,
      label: config.label,
      timestamp: Date.now(),
    });

    if (isConnected) {
      if (config.autoRead) {
        readCoil();
      }

      if (config.pollingInterval > 0 && !pollingTimer) {
        pollingTimer = setInterval(() => readCoil(), config.pollingInterval);
      }
    } else {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }
  });

  bidding.on('read-coils-response', (response) => {
    if (response.success && response.address === config.address) {
      const newState = response.values[0] || false;

      if (newState !== state) {
        const oldState = state;
        state = newState;
        system.log(`[${metadata.name}] Estado mudou: ${oldState} → ${state}`);

        bidding.emit('coil-changed', {
          address: config.address,
          label: config.label,
          oldState,
          newState: state,
          timestamp: Date.now(),
        });
      }

      bidding.emit('coil-value', {
        address: config.address,
        label: config.label,
        state,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao ler:`, response.error);
      bidding.emit('coil-error', {
        operation: 'read',
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  bidding.on('write-single-coil-response', (response) => {
    if (response.success && response.address === config.address) {
      const oldState = state;
      state = response.value;
      system.log(`[${metadata.name}] Escrita confirmada: ${state}`);

      if (oldState !== state) {
        bidding.emit('coil-changed', {
          address: config.address,
          label: config.label,
          oldState,
          newState: state,
          timestamp: Date.now(),
        });
      }

      bidding.emit('coil-value', {
        address: config.address,
        label: config.label,
        state,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao escrever:`, response.error);
      bidding.emit('coil-error', {
        operation: 'write',
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  system.log(`[${metadata.name}] Driver inicializado`);
  bidding.emit('coil-status', {
    event: 'initialized',
    address: config.address,
    label: config.label,
    readOnly: config.readOnly,
    timestamp: Date.now(),
  });

  // ✅ Retorna API pública da instância
  return {
    address: config.address,
    label: config.label,
    readOnly: config.readOnly,

    // Estado
    getState: () => state,
    isConnected: () => isConnected,

    // Comandos
    set: (value, requestId) => {
      if (config.readOnly) {
        throw new Error('Coil está em modo somente leitura');
      }

      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }

      const reqId = requestId || getRequestId();
      bidding.emit('write-single-coil', {
        address: config.address,
        value: !!value,
        requestId: reqId,
      });

      return reqId;
    },

    toggle: (requestId) => {
      if (config.readOnly) {
        throw new Error('Coil está em modo somente leitura');
      }

      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }

      const reqId = requestId || getRequestId();
      bidding.emit('write-single-coil', {
        address: config.address,
        value: !state,
        requestId: reqId,
      });

      return reqId;
    },

    pulse: (duration = 1000, requestId) => {
      if (config.readOnly) {
        throw new Error('Coil está em modo somente leitura');
      }

      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }

      const reqId = requestId || getRequestId();

      bidding.emit('write-single-coil', {
        address: config.address,
        value: true,
        requestId: `${reqId}-on`,
      });

      setTimeout(() => {
        bidding.emit('write-single-coil', {
          address: config.address,
          value: false,
          requestId: `${reqId}-off`,
        });
      }, duration);

      return reqId;
    },

    refresh: () => {
      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }
      readCoil();
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

      bidding.emit('coil-status', {
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
