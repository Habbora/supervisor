/**
 * Exemplo de Uso Completo
 *
 * Mostra como drivers e endpoints usam o sistema de bindings
 */

import { systemBindings } from './system-bindings';

/**
 * ===============================================
 * EXEMPLO 1: Driver Modbus cria BindingMaster
 * ===============================================
 */

class ModbusDriver {
  private socket: any;
  private bindingMaster: any;

  async initialize(config: any) {
    console.log('[ModbusDriver] Initializing...');

    // 1. Conecta ao CLP via TCP
    this.socket = await connectTCP(config.host, config.port || 502);

    // 2. Cria Binding Master através do system
    this.bindingMaster = systemBindings.createBindingMaster('modbus', {
      id: config.bindingId || 'modbus_0',
      unitId: config.unitId || 1,
    });

    // 3. Escuta comandos vindos dos slaves (endpoints)
    this.setupEventHandlers();

    console.log(`[ModbusDriver] Binding master '${this.bindingMaster.id}' ready`);
  }

  private setupEventHandlers() {
    // Quando algum endpoint chamar slave.write('coil', address, value)
    // o master recebe aqui
    this.bindingMaster.on('write:coil', async (data: any) => {
      const { slaveId, address, value } = data;
      console.log(`[ModbusDriver] Write coil from ${slaveId}: ${address} = ${value}`);

      // Executa protocolo Modbus real
      await this.modbusWriteCoil(address, value);

      // Depois de escrever, faz broadcast do novo valor
      this.bindingMaster.broadcastState('coil', address, value);
    });

    // Quando algum endpoint chamar slave.read('coil', address)
    this.bindingMaster.on('read:coil', async (data: any) => {
      const { slaveId, address } = data;
      console.log(`[ModbusDriver] Read coil from ${slaveId}: ${address}`);

      // Lê do CLP
      const value = await this.modbusReadCoil(address);
      return value;
    });

    // Outros handlers...
    this.bindingMaster.on('write:register', async (data: any) => {
      await this.modbusWriteRegister(data.address, data.value);
      this.bindingMaster.broadcastState('register', data.address, data.value);
    });

    this.bindingMaster.on('read:register', async (data: any) => {
      return await this.modbusReadRegister(data.address);
    });
  }

  private async modbusWriteCoil(address: number, value: boolean) {
    // Protocolo Modbus FC05
    console.log(`[Modbus] FC05 Write Coil ${address} = ${value}`);
    // ... implementação real
  }

  private async modbusReadCoil(address: number): Promise<boolean> {
    // Protocolo Modbus FC01
    console.log(`[Modbus] FC01 Read Coil ${address}`);
    // ... implementação real
    return false; // dummy
  }

  private async modbusWriteRegister(address: number, value: number) {
    console.log(`[Modbus] FC06 Write Register ${address} = ${value}`);
  }

  private async modbusReadRegister(address: number): Promise<number> {
    console.log(`[Modbus] FC03 Read Register ${address}`);
    return 0; // dummy
  }

  async close() {
    await this.bindingMaster.close();
    await this.socket.close();
  }
}

/**
 * ===============================================
 * EXEMPLO 2: Endpoint cria BindingSlave
 * ===============================================
 */

class DigitalOutputEndpoint {
  private id: string;
  private address: number;
  private bindingSlave: any;
  private state = { value: false };

  constructor(id: string, address: number) {
    this.id = id;
    this.address = address;
  }

  async initialize(config: any) {
    console.log(`[DO:${this.id}] Initializing...`);

    // 1. Cria Binding Slave através do system
    this.bindingSlave = systemBindings.createBindingSlave({
      endpointId: this.id,
      endpointType: 'DigitalOutput',
    });

    // 2. Escuta eventos do binding
    this.setupEventHandlers();

    // 3. Se tiver bindingMasterId, conecta automaticamente
    if (config.bindingMasterId) {
      await this.connectToBinding(config.bindingMasterId);
    } else {
      console.log(`[DO:${this.id}] Created but not connected`);
    }
  }

  private setupEventHandlers() {
    // Quando conectar ao master
    this.bindingSlave.on('connected', (data: any) => {
      console.log(`[DO:${this.id}] Connected to ${data.masterId}`);
    });

    // Quando desconectar
    this.bindingSlave.on('disconnected', () => {
      console.log(`[DO:${this.id}] Disconnected`);
    });

    // Quando receber atualização de estado do master (polling)
    this.bindingSlave.on('state:updated', (data: any) => {
      console.log(`[DO:${this.id}] State updated: ${data.value}`);
      this.state.value = data.value;
    });

    // Quando master fechar
    this.bindingSlave.on('master:closed', () => {
      console.log(`[DO:${this.id}] Master closed!`);
    });
  }

  async connectToBinding(masterId: string) {
    console.log(`[DO:${this.id}] Connecting to ${masterId}...`);

    await this.bindingSlave.connect(masterId);

    // Registra interesse em receber updates deste endereço
    this.bindingSlave.listenTo('coil', this.address);

    // Lê estado inicial
    await this.read();
  }

  async disconnect() {
    await this.bindingSlave.disconnect();
  }

  async setOn() {
    if (!this.bindingSlave.isConnected()) {
      throw new Error('Not connected to any binding');
    }

    console.log(`[DO:${this.id}] Setting ON`);

    // Envia comando ao master
    await this.bindingSlave.write('coil', this.address, true);

    // Atualiza estado local
    this.state.value = true;
  }

  async setOff() {
    if (!this.bindingSlave.isConnected()) {
      throw new Error('Not connected to any binding');
    }

    console.log(`[DO:${this.id}] Setting OFF`);

    await this.bindingSlave.write('coil', this.address, false);
    this.state.value = false;
  }

  async read() {
    if (!this.bindingSlave.isConnected()) {
      throw new Error('Not connected to any binding');
    }

    console.log(`[DO:${this.id}] Reading...`);

    const value = await this.bindingSlave.read('coil', this.address);
    this.state.value = value;

    return value;
  }

  async close() {
    await this.bindingSlave.close();
  }
}

/**
 * ===============================================
 * EXEMPLO 3: Usando tudo junto
 * ===============================================
 */

async function fullExample() {
  console.log('\n=== FULL EXAMPLE ===\n');

  // 1. Criar driver Modbus
  const modbusDriver = new ModbusDriver();
  await modbusDriver.initialize({
    host: '192.168.1.100',
    port: 502,
    bindingId: 'modbus_factory',
    unitId: 1,
  });

  // 2. Criar endpoint (NÃO conectado ainda)
  const pump = new DigitalOutputEndpoint('pump_001', 5);
  await pump.initialize({
    // bindingMasterId não especificado
  });

  console.log('\n--- Endpoint criado mas NÃO conectado ---');
  console.log('Stats:', systemBindings.getStats());

  // 3. Conectar dinamicamente
  console.log('\n--- Conectando endpoint ao driver ---');
  await pump.connectToBinding('modbus_factory');

  console.log('Stats:', systemBindings.getStats());

  // 4. Usar o endpoint
  console.log('\n--- Usando endpoint ---');
  await pump.setOn();
  await sleep(100);
  await pump.setOff();

  // 5. Criar segundo driver (backup)
  console.log('\n--- Criando driver backup ---');
  const modbusBackup = new ModbusDriver();
  await modbusBackup.initialize({
    host: '192.168.1.200',
    port: 502,
    bindingId: 'modbus_backup',
    unitId: 1,
  });

  // 6. Trocar endpoint para o backup
  console.log('\n--- Trocando endpoint para backup ---');
  await systemBindings.switchSlaveMaster('pump_001', 'modbus_backup');

  console.log('Stats:', systemBindings.getStats());

  // 7. Usar novamente (agora via backup)
  console.log('\n--- Usando endpoint no backup ---');
  await pump.setOn();

  // 8. Cleanup
  console.log('\n--- Cleanup ---');
  await systemBindings.closeAll();
}

/**
 * ===============================================
 * EXEMPLO 4: API REST para gerenciar bindings
 * ===============================================
 */

// GET /api/bindings
function listBindings() {
  return {
    bindings: systemBindings.listMasters().map(m => ({
      id: m.id,
      type: m.type,
      slaveCount: m.getSlaveCount(),
      slaves: m.getConnectedSlaves(),
    })),
  };
}

// POST /api/endpoints/:id/connect
async function connectEndpoint(endpointId: string, body: { bindingMasterId: string }) {
  await systemBindings.connectSlaveToMaster(endpointId, body.bindingMasterId);

  return {
    success: true,
    endpoint: endpointId,
    connected: true,
    bindingMaster: body.bindingMasterId,
  };
}

// POST /api/endpoints/:id/disconnect
async function disconnectEndpoint(endpointId: string) {
  await systemBindings.disconnectSlave(endpointId);

  return {
    success: true,
    endpoint: endpointId,
    connected: false,
  };
}

// POST /api/endpoints/:id/switch
async function switchEndpointBinding(endpointId: string, body: { bindingMasterId: string }) {
  const previousMasterId = systemBindings.getMasterForSlave(endpointId);

  await systemBindings.switchSlaveMaster(endpointId, body.bindingMasterId);

  return {
    success: true,
    endpoint: endpointId,
    previousBinding: previousMasterId,
    currentBinding: body.bindingMasterId,
  };
}

// GET /api/bindings/:id/endpoints
function getBindingEndpoints(bindingId: string) {
  const slaves = systemBindings.getSlavesForMaster(bindingId);

  return {
    bindingId,
    endpoints: slaves,
  };
}

// GET /api/stats
function getSystemStats() {
  return systemBindings.getStats();
}

/**
 * ===============================================
 * HELPERS
 * ===============================================
 */

function connectTCP(host: string, port: number): Promise<any> {
  // Dummy TCP connection
  return Promise.resolve({
    send: async (data: any) => {},
    receive: async () => Buffer.from([]),
    close: async () => {},
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ===============================================
 * EXECUÇÃO
 * ===============================================
 */

// Executar exemplo
// fullExample().catch(console.error);
