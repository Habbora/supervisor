// --- Modbus Discrete Input Driver (Multiple Instances) ---

const metadata = {
  name: 'Modbus Discrete Input',
  version: '2.0.0',
  description: 'Driver para leitura de Discrete Input (entrada digital) via Modbus TCP.',
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
    name: 'Input Address',
    type: 'number',
    required: true,
    default: 0,
    description: 'Endereço do discrete input Modbus (0-65535)',
  },
  pollingInterval: {
    name: 'Polling Interval (ms)',
    type: 'number',
    required: true,
    default: 500,
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
    description: 'Rótulo descritivo (ex: "Botão Emergência", "Sensor Porta")',
  },
  invertLogic: {
    name: 'Invert Logic',
    type: 'boolean',
    default: false,
    description: 'Inverter lógica do sensor (true = NOT)',
  },
};

export const onInit = async (system, config) => {
  system.log(`[${metadata.name}] Inicializando input "${config.label || config.address}"...`);

  // ✅ Estado da instância (via closure)
  let state = false;
  let requestCounter = 0;
  let pollingTimer = null;
  let isConnected = false;
  let bidding = system.bidding.createSlave(config.biddingChannel);

  const getRequestId = () => {
    requestCounter++;
    return `discrete-input-${config.address}-${requestCounter}-${Date.now()}`;
  };

  const readInput = () => {
    bidding.emit('read-discrete-inputs', {
      address: config.address,
      quantity: 1,
      requestId: getRequestId(),
    });
  };

  // === Event Handlers ===

  bidding.on('connection-status', (data) => {
    isConnected = data.status === 'connected';
    system.log(`[${metadata.name}] Modbus ${data.status}`);

    bidding.emit('discrete-input-status', {
      event: `modbus-${data.status}`,
      address: config.address,
      label: config.label,
      timestamp: Date.now(),
    });

    if (isConnected) {
      if (config.autoRead) {
        readInput();
      }

      if (config.pollingInterval > 0 && !pollingTimer) {
        system.log(`[${metadata.name}] Polling a cada ${config.pollingInterval}ms`);
        pollingTimer = setInterval(() => readInput(), config.pollingInterval);
      }
    } else {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }
  });

  bidding.on('read-discrete-inputs-response', (response) => {
    if (response.success && response.address === config.address) {
      let rawState = response.values[0] || false;
      const newState = config.invertLogic ? !rawState : rawState;

      if (newState !== state) {
        const oldState = state;
        state = newState;
        system.log(`[${metadata.name}] Input mudou: ${oldState} → ${state}`);

        bidding.emit('discrete-input-changed', {
          address: config.address,
          label: config.label,
          oldState,
          newState: state,
          risingEdge: !oldState && state,
          fallingEdge: oldState && !state,
          timestamp: Date.now(),
        });
      }

      bidding.emit('discrete-input-value', {
        address: config.address,
        label: config.label,
        state,
        timestamp: Date.now(),
      });
    } else if (!response.success) {
      system.log(`[${metadata.name}] Erro ao ler:`, response.error);
      bidding.emit('discrete-input-error', {
        address: config.address,
        error: response.error,
        timestamp: Date.now(),
      });
    }
  });

  system.log(`[${metadata.name}] Driver inicializado (SOMENTE LEITURA)`);
  bidding.emit('discrete-input-status', {
    event: 'initialized',
    address: config.address,
    label: config.label,
    timestamp: Date.now(),
  });

  // ✅ Retorna API pública da instância
  return {
    address: config.address,
    label: config.label,

    // Estado
    getState: () => state,
    isConnected: () => isConnected,

    // Comandos
    refresh: () => {
      if (!isConnected) {
        throw new Error('Modbus não conectado');
      }
      readInput();
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

      bidding.emit('discrete-input-status', {
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
