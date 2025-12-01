/**
 * Modbus TCP Client Driver
 *
 * Cria um BindingMaster que endpoints podem se conectar
 */

import { Driver, OnInit, OnClose, Poll } from '../03-binding-architecture/binding-architecture';

@Driver({
  name: 'Modbus TCP Client',
  version: '1.0.0',
  description: 'Cliente Modbus TCP/IP - cria binding master',
  protocol: 'modbus-tcp',
})
export class ModbusTCPClient {
  private socket: any;
  private bindingMaster: any;
  private connected = false;

  /**
   * ===============================================
   * LIFECYCLE
   * ===============================================
   */

  @OnInit()
  async initialize() {
    system.log.info('[Modbus] Initializing...');

    // 1. Cria socket TCP
    this.socket = system.tcp.createSocket();
    await this.socket.connect(config.host, config.port || 502);
    this.connected = true;

    // 2. Cria Binding Master
    this.bindingMaster = system.createBindingMaster('modbus', {
      id: config.bindingId || 'modbus_0',
      socket: this.socket,
      unitId: config.unitId || 1,
      timeout: config.timeout || 5000,
    });

    // 3. Escuta comandos dos slaves (endpoints)
    this.setupBindingListeners();

    system.log.info(`[Modbus] Binding master '${this.bindingMaster.id}' created`);
  }

  @OnClose()
  async cleanup() {
    system.log.info('[Modbus] Closing...');

    if (this.bindingMaster) {
      await this.bindingMaster.close();
    }

    if (this.socket) {
      await this.socket.close();
    }

    this.connected = false;
  }

  @Poll({ interval: 5000 })
  async healthCheck() {
    if (!this.connected) {
      system.log.warn('[Modbus] Connection lost, reconnecting...');
      try {
        await this.initialize();
      } catch (error) {
        system.log.error('[Modbus] Reconnect failed:', error);
      }
    }
  }

  /**
   * ===============================================
   * BINDING LISTENERS
   * ===============================================
   */

  private setupBindingListeners() {
    // Write Coil (DO)
    this.bindingMaster.on('write:coil', async (data: { address: number; value: boolean }) => {
      system.log.debug('[Modbus] Write coil:', data);
      await this.modbusWriteCoil(data.address, data.value);
    });

    // Read Coil (DO)
    this.bindingMaster.on('read:coil', async (data: { address: number }) => {
      system.log.debug('[Modbus] Read coil:', data.address);
      const value = await this.modbusReadCoil(data.address);
      return value;
    });

    // Write Register (AO/Register)
    this.bindingMaster.on('write:register', async (data: { address: number; value: number }) => {
      system.log.debug('[Modbus] Write register:', data);
      await this.modbusWriteRegister(data.address, data.value);
    });

    // Read Register (AO/AI/Register)
    this.bindingMaster.on('read:register', async (data: { address: number }) => {
      system.log.debug('[Modbus] Read register:', data.address);
      const value = await this.modbusReadRegister(data.address);
      return value;
    });

    // Read Input (DI)
    this.bindingMaster.on('read:input', async (data: { address: number }) => {
      system.log.debug('[Modbus] Read input:', data.address);
      const value = await this.modbusReadDiscreteInput(data.address);
      return value;
    });
  }

  /**
   * ===============================================
   * MODBUS FUNCTIONS (Protocolo real)
   * ===============================================
   */

  private async modbusWriteCoil(address: number, value: boolean): Promise<void> {
    // FC05 - Write Single Coil
    const packet = this.buildModbusPacket(0x05, Buffer.from([
      address >> 8, address & 0xFF,
      value ? 0xFF : 0x00, value ? 0x00 : 0x00,
    ]));

    await this.socket.send(packet);
    await this.socket.receive(); // Aguarda confirmação
  }

  private async modbusReadCoil(address: number): Promise<boolean> {
    // FC01 - Read Coils
    const packet = this.buildModbusPacket(0x01, Buffer.from([
      address >> 8, address & 0xFF,
      0x00, 0x01, // Quantity: 1
    ]));

    await this.socket.send(packet);
    const response = await this.socket.receive();

    // Parse resposta
    return (response[9] & 0x01) === 0x01;
  }

  private async modbusWriteRegister(address: number, value: number): Promise<void> {
    // FC06 - Write Single Register
    const packet = this.buildModbusPacket(0x06, Buffer.from([
      address >> 8, address & 0xFF,
      value >> 8, value & 0xFF,
    ]));

    await this.socket.send(packet);
    await this.socket.receive();
  }

  private async modbusReadRegister(address: number): Promise<number> {
    // FC03 - Read Holding Registers
    const packet = this.buildModbusPacket(0x03, Buffer.from([
      address >> 8, address & 0xFF,
      0x00, 0x01, // Quantity: 1
    ]));

    await this.socket.send(packet);
    const response = await this.socket.receive();

    // Parse resposta (int16 big-endian)
    return (response[9] << 8) | response[10];
  }

  private async modbusReadDiscreteInput(address: number): Promise<boolean> {
    // FC02 - Read Discrete Inputs
    const packet = this.buildModbusPacket(0x02, Buffer.from([
      address >> 8, address & 0xFF,
      0x00, 0x01,
    ]));

    await this.socket.send(packet);
    const response = await this.socket.receive();

    return (response[9] & 0x01) === 0x01;
  }

  /**
   * ===============================================
   * HELPERS
   * ===============================================
   */

  private buildModbusPacket(functionCode: number, data: Buffer): Buffer {
    const unitId = config.unitId || 0x01;

    return Buffer.concat([
      Buffer.from([0x00, 0x00]),              // Transaction ID (será adicionado pelo socket)
      Buffer.from([0x00, 0x00]),              // Protocol ID
      Buffer.from([0x00, data.length + 2]),   // Length
      Buffer.from([unitId]),                  // Unit ID
      Buffer.from([functionCode]),            // Function Code
      data,                                   // Data
    ]);
  }
}

export default ModbusTCPClient;
