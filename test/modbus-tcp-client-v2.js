// --- Modbus TCP Client Driver (Multiple Instances) ---

/**
 * Metadados (compartilhados entre todas as instâncias)
 */
const metadata = {
  name: 'Modbus TCP Client',
  version: '2.0.0',
  description: 'Driver Modbus TCP com suporte a múltiplas instâncias.',
};

/**
 * Esquema de configuração (compartilhado)
 */
export const configSchema = {
  biddingChannel: {
    name: 'Bidding Channel',
    type: 'string',
    default: 'modbus-tcp-events',
    description: 'Nome do canal bidding',
  },
  host: {
    name: 'Host',
    type: 'string',
    required: true,
    default: '127.0.0.1',
    description: 'Endereço IP do servidor Modbus',
  },
  port: {
    name: 'Port',
    type: 'number',
    required: true,
    default: 502,
    description: 'Porta TCP do servidor Modbus',
  },
  unitId: {
    name: 'Unit ID',
    type: 'number',
    default: 1,
    description: 'Identificador da unidade Modbus (slave ID)',
  },
  timeout: {
    name: 'Timeout (ms)',
    type: 'number',
    default: 5000,
    description: 'Timeout para requisições Modbus',
  },
  reconnectInterval: {
    name: 'Reconnect Interval (ms)',
    type: 'number',
    default: 5000,
    description: 'Intervalo entre tentativas de reconexão',
  },
  autoReconnect: {
    name: 'Auto Reconnect',
    type: 'boolean',
    default: true,
    description: 'Reconectar automaticamente em caso de desconexão',
  },
};

/**
 * Códigos de função Modbus
 */
const ModbusFunctionCodes = {
  READ_COILS: 0x01,
  READ_DISCRETE_INPUTS: 0x02,
  READ_HOLDING_REGISTERS: 0x03,
  READ_INPUT_REGISTERS: 0x04,
  WRITE_SINGLE_COIL: 0x05,
  WRITE_SINGLE_REGISTER: 0x06,
  WRITE_MULTIPLE_COILS: 0x0F,
  WRITE_MULTIPLE_REGISTERS: 0x10,
};

/**
 * ✨ MAGIC HAPPENS HERE!
 * onInit retorna um objeto com métodos que têm acesso ao estado via closure
 *
 * É como ter "escopo global" mas isolado para cada instância!
 */
export const onInit = async (system, config) => {
  system.log(`[${metadata.name}] Inicializando ${config.host}:${config.port}...`);

  // ✅ "Escopo global" da instância (via closure)
  // Cada chamada de onInit cria NOVAS variáveis
  let socket = null;
  let transactionId = 0;
  let pendingRequests = new Map();
  let reconnectTimer = null;
  let bidding = null;

  // ==========================================
  // Funções internas (como se fosse escopo global!)
  // ==========================================

  const getNextTransactionId = () => {
    transactionId = (transactionId + 1) % 0xFFFF;
    return transactionId;
  };

  const createModbusFrame = (functionCode, data, unitId) => {
    const txId = getNextTransactionId();
    const protocolId = 0x0000;
    const length = data.length + 2;

    const buffer = Buffer.allocUnsafe(7 + data.length);
    buffer.writeUInt16BE(txId, 0);
    buffer.writeUInt16BE(protocolId, 2);
    buffer.writeUInt16BE(length, 4);
    buffer.writeUInt8(unitId, 6);
    buffer.writeUInt8(functionCode, 7);
    data.copy(buffer, 8);

    return { buffer, txId };
  };

  const parseModbusResponse = (buffer) => {
    if (buffer.length < 8) {
      throw new Error('Response too short');
    }

    const txId = buffer.readUInt16BE(0);
    const protocolId = buffer.readUInt16BE(2);
    const length = buffer.readUInt16BE(4);
    const unitId = buffer.readUInt8(6);
    const functionCode = buffer.readUInt8(7);

    if (functionCode & 0x80) {
      const exceptionCode = buffer.readUInt8(8);
      throw new Error(`Modbus Exception ${exceptionCode}`);
    }

    const data = buffer.slice(8);

    return { txId, protocolId, length, unitId, functionCode, data };
  };

  const readHoldingRegisters = (address, quantity) => {
    return new Promise((resolve, reject) => {
      const data = Buffer.allocUnsafe(4);
      data.writeUInt16BE(address, 0);
      data.writeUInt16BE(quantity, 2);

      const { buffer, txId } = createModbusFrame(
        ModbusFunctionCodes.READ_HOLDING_REGISTERS,
        data,
        config.unitId
      );

      const timeout = setTimeout(() => {
        pendingRequests.delete(txId);
        reject(new Error('Request timeout'));
      }, config.timeout);

      pendingRequests.set(txId, {
        resolve: (response) => {
          clearTimeout(timeout);
          const byteCount = response.data.readUInt8(0);
          const values = [];
          for (let i = 0; i < quantity; i++) {
            values.push(response.data.readUInt16BE(1 + i * 2));
          }
          resolve(values);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      if (socket) {
        socket.write(buffer);
      } else {
        clearTimeout(timeout);
        pendingRequests.delete(txId);
        reject(new Error('Socket not connected'));
      }
    });
  };

  const writeSingleRegister = (address, value) => {
    return new Promise((resolve, reject) => {
      const data = Buffer.allocUnsafe(4);
      data.writeUInt16BE(address, 0);
      data.writeUInt16BE(value, 2);

      const { buffer, txId } = createModbusFrame(
        ModbusFunctionCodes.WRITE_SINGLE_REGISTER,
        data,
        config.unitId
      );

      const timeout = setTimeout(() => {
        pendingRequests.delete(txId);
        reject(new Error('Request timeout'));
      }, config.timeout);

      pendingRequests.set(txId, {
        resolve: (response) => {
          clearTimeout(timeout);
          const responseAddress = response.data.readUInt16BE(0);
          const responseValue = response.data.readUInt16BE(2);
          resolve({ address: responseAddress, value: responseValue });
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      if (socket) {
        socket.write(buffer);
      } else {
        clearTimeout(timeout);
        pendingRequests.delete(txId);
        reject(new Error('Socket not connected'));
      }
    });
  };

  const connectSocket = async () => {
    const handleOpen = (sock) => {
      system.log(`[${metadata.name}] Conectado a ${config.host}:${config.port}`);
      bidding.emit('connection-status', {
        status: 'connected',
        host: config.host,
        port: config.port,
        timestamp: Date.now(),
      });
    };

    const handleData = (sock, data) => {
      try {
        const response = parseModbusResponse(data);

        bidding.emit('data-received', {
          transactionId: response.txId,
          functionCode: response.functionCode,
          unitId: response.unitId,
          dataLength: response.data.length,
          timestamp: Date.now(),
        });

        const pending = pendingRequests.get(response.txId);
        if (pending) {
          pendingRequests.delete(response.txId);
          pending.resolve(response);
        }
      } catch (error) {
        system.log(`[${metadata.name}] Erro ao processar dados:`, error.message);
        bidding.emit('parse-error', {
          message: error.message,
          timestamp: Date.now(),
        });
      }
    };

    const handleSocketError = (error) => {
      system.log(`[${metadata.name}] Erro no socket:`, error.message);
      bidding.emit('socket-error', {
        message: error.message,
        timestamp: Date.now(),
      });
    };

    const handleSocketClose = () => {
      system.log(`[${metadata.name}] Conexão fechada`);
      bidding.emit('connection-status', {
        status: 'disconnected',
        timestamp: Date.now(),
      });

      for (const [txId, request] of pendingRequests.entries()) {
        request.reject(new Error('Connection closed'));
      }
      pendingRequests.clear();

      socket = null;

      if (config.autoReconnect) {
        reconnectTimer = setTimeout(() => connectSocket(), config.reconnectInterval);
      }
    };

    socket = await system.network.createTcpSocket({
      hostname: config.host,
      port: config.port,
      socket: {
        open: handleOpen,
        data: handleData,
        error: handleSocketError,
        close: handleSocketClose,
      },
    });

    return socket;
  };

  // Inicialização
  bidding = system.bidding.createMaster(config.biddingChannel || `modbus-tcp-${config.host}-${config.port}`);

  // Setup event listeners
  bidding.on('read-holding-registers', async ({ address, quantity, requestId }) => {
    try {
      const values = await readHoldingRegisters(address, quantity);
      bidding.emit('read-holding-registers-response', {
        requestId,
        success: true,
        address,
        quantity,
        values,
        timestamp: Date.now(),
      });
    } catch (error) {
      bidding.emit('read-holding-registers-response', {
        requestId,
        success: false,
        address,
        quantity,
        error: error.message,
        timestamp: Date.now(),
      });
    }
  });

  bidding.on('write-single-register', async ({ address, value, requestId }) => {
    try {
      const response = await writeSingleRegister(address, value);
      bidding.emit('write-single-register-response', {
        requestId,
        success: true,
        address: response.address,
        value: response.value,
        timestamp: Date.now(),
      });
    } catch (error) {
      bidding.emit('write-single-register-response', {
        requestId,
        success: false,
        address,
        value,
        error: error.message,
        timestamp: Date.now(),
      });
    }
  });

  // Conecta
  try {
    await connectSocket();
    system.log(`[${metadata.name}] Driver inicializado com sucesso`);
  } catch (error) {
    system.log(`[${metadata.name}] Falha ao conectar:`, error.message);
    if (config.autoReconnect) {
      reconnectTimer = setTimeout(() => connectSocket(), config.reconnectInterval);
    }
  }

  // ==========================================
  // ✨ RETORNA "API PÚBLICA" DA INSTÂNCIA
  // ==========================================
  return {
    // Informações
    host: config.host,
    port: config.port,

    // Métodos públicos (têm acesso ao estado via closure!)
    readHoldingRegisters,
    writeSingleRegister,

    // Estado
    isConnected: () => socket !== null,
    getPendingRequests: () => pendingRequests.size,

    // Cleanup
    close: () => {
      system.log(`[${metadata.name}] Finalizando ${config.host}:${config.port}...`);

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      for (const [txId, request] of pendingRequests.entries()) {
        request.reject(new Error('Driver shutting down'));
      }
      pendingRequests.clear();

      if (socket) {
        socket.close();
        socket = null;
      }

      bidding.emit('connection-status', {
        status: 'closed',
        timestamp: Date.now(),
      });
    },

    // Acesso ao bidding (se precisar)
    bidding,
  };
};

/**
 * onClose agora recebe a instância retornada pelo onInit
 */
export const onClose = (instance) => {
  if (instance && instance.close) {
    instance.close();
  }
};

export default {
  metadata,
  configSchema,
  onInit,
  onClose,
};
