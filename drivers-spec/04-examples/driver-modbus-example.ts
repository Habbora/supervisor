/**
 * Exemplo: Driver Modbus TCP
 *
 * Driver que exporta bindings para comunicação Modbus
 * Outros endpoints podem se conectar a esses bindings
 */

import {
  Driver,
  OnInit,
  OnClose,
  Poll,
  ExportBooleanBinding,
  ExportNumberBinding,
  ExportDimmerBinding,
  BooleanBinding,
  NumberBinding,
  DimmerBinding,
} from './binding-architecture';

@Driver({
  name: 'Modbus TCP Driver',
  version: '1.0.0',
  description: 'Driver de comunicação Modbus TCP/IP',
  protocol: 'modbus-tcp',
})
export class ModbusTCPDriver {
  private socket!: any;
  private connected = false;

  @OnInit()
  async initialize() {
    system.log.info('Initializing Modbus TCP Driver...');

    // Cria socket TCP usando primitivas do system
    this.socket = system.tcp.createSocket();
    await this.socket.connect(config.host, config.port || 502);
    this.connected = true;

    system.log.info(`Connected to ${config.host}:${config.port}`);
  }

  @OnClose()
  async cleanup() {
    if (this.socket) {
      await this.socket.close();
    }
  }

  /**
   * ===============================================
   * BINDINGS EXPORTADOS
   * ===============================================
   */

  /**
   * Binding: modbus_coil
   * Para DigitalOutput e DigitalInput
   */
  @ExportBooleanBinding({
    name: 'modbus_coil',
    description: 'Modbus Coil (Read/Write)',
    capabilities: ['read', 'write'],
  })
  async coilBinding(): Promise<BooleanBinding> {
    return {
      name: 'modbus_coil',
      type: 'boolean',

      read: async (address: number): Promise<boolean> => {
        system.log.debug(`Reading coil at address ${address}`);

        // Constrói comando Modbus Read Coil (FC 01)
        const buffer = Buffer.alloc(12);
        buffer.writeUInt16BE(0x0001, 0); // Transaction ID
        buffer.writeUInt16BE(0x0000, 2); // Protocol ID
        buffer.writeUInt16BE(0x0006, 4); // Length
        buffer.writeUInt8(0x01, 6); // Unit ID
        buffer.writeUInt8(0x01, 7); // Function Code (Read Coils)
        buffer.writeUInt16BE(address, 8); // Starting Address
        buffer.writeUInt16BE(0x0001, 10); // Quantity (1 coil)

        await this.socket.send(buffer);
        const response = await this.socket.receive();

        // Parse resposta
        const value = response[9] === 0x01;
        return value;
      },

      write: async (address: number, value: boolean): Promise<void> => {
        system.log.debug(`Writing coil at address ${address} = ${value}`);

        // Constrói comando Modbus Write Single Coil (FC 05)
        const buffer = Buffer.alloc(12);
        buffer.writeUInt16BE(0x0001, 0); // Transaction ID
        buffer.writeUInt16BE(0x0000, 2); // Protocol ID
        buffer.writeUInt16BE(0x0006, 4); // Length
        buffer.writeUInt8(0x01, 6); // Unit ID
        buffer.writeUInt8(0x05, 7); // Function Code (Write Single Coil)
        buffer.writeUInt16BE(address, 8); // Coil Address
        buffer.writeUInt16BE(value ? 0xff00 : 0x0000, 10); // Value

        await this.socket.send(buffer);
        await this.socket.receive(); // Aguarda confirmação
      },
    };
  }

  /**
   * Binding: modbus_holding_register
   * Para AnalogOutput, AnalogInput, Register
   */
  @ExportNumberBinding({
    name: 'modbus_holding_register',
    description: 'Modbus Holding Register (Read/Write)',
    capabilities: ['read', 'write'],
    dataType: 'int16',
  })
  async holdingRegisterBinding(): Promise<NumberBinding> {
    return {
      name: 'modbus_holding_register',
      type: 'number',
      dataType: 'int16',

      read: async (address: number): Promise<number> => {
        system.log.debug(`Reading holding register at address ${address}`);

        // Constrói comando Modbus Read Holding Register (FC 03)
        const buffer = Buffer.alloc(12);
        buffer.writeUInt16BE(0x0001, 0); // Transaction ID
        buffer.writeUInt16BE(0x0000, 2); // Protocol ID
        buffer.writeUInt16BE(0x0006, 4); // Length
        buffer.writeUInt8(0x01, 6); // Unit ID
        buffer.writeUInt8(0x03, 7); // Function Code (Read Holding Registers)
        buffer.writeUInt16BE(address, 8); // Starting Address
        buffer.writeUInt16BE(0x0001, 10); // Quantity (1 register)

        await this.socket.send(buffer);
        const response = await this.socket.receive();

        // Parse resposta (int16 big-endian)
        const value = response.readInt16BE(9);
        return value;
      },

      write: async (address: number, value: number): Promise<void> => {
        system.log.debug(`Writing holding register at address ${address} = ${value}`);

        // Constrói comando Modbus Write Single Register (FC 06)
        const buffer = Buffer.alloc(12);
        buffer.writeUInt16BE(0x0001, 0); // Transaction ID
        buffer.writeUInt16BE(0x0000, 2); // Protocol ID
        buffer.writeUInt16BE(0x0006, 4); // Length
        buffer.writeUInt8(0x01, 6); // Unit ID
        buffer.writeUInt8(0x06, 7); // Function Code (Write Single Register)
        buffer.writeUInt16BE(address, 8); // Register Address
        buffer.writeUInt16BE(value, 10); // Value

        await this.socket.send(buffer);
        await this.socket.receive(); // Aguarda confirmação
      },
    };
  }

  /**
   * Binding: modbus_dimmer
   * Para Dimmer (0-100% mapeado para 0-255)
   */
  @ExportDimmerBinding({
    name: 'modbus_dimmer',
    description: 'Modbus Dimmer via Holding Register (0-100%)',
    capabilities: ['read', 'write', 'fade'],
  })
  async dimmerBinding(): Promise<DimmerBinding> {
    return {
      name: 'modbus_dimmer',
      type: 'dimmer',

      read: async (address: number): Promise<number> => {
        // Lê register e converte 0-255 para 0-100
        const registerBinding = await this.holdingRegisterBinding();
        const rawValue = await registerBinding.read(address);
        const level = Math.round((rawValue / 255) * 100);
        return level;
      },

      write: async (address: number, level: number): Promise<void> => {
        // Converte 0-100 para 0-255 e escreve no register
        const rawValue = Math.round((level / 100) * 255);
        const registerBinding = await this.holdingRegisterBinding();
        await registerBinding.write(address, rawValue);
      },

      fade: async (address: number, level: number, fadeTime: number): Promise<void> => {
        // Implementa fade via steps
        const currentLevel = await this.read(address);
        const steps = Math.abs(level - currentLevel);
        const stepDelay = fadeTime / steps;

        const direction = level > currentLevel ? 1 : -1;

        for (let i = 0; i <= steps; i++) {
          const newLevel = currentLevel + i * direction;
          await this.write(address, newLevel);
          await system.time.setTimeout(() => {}, stepDelay);
        }
      },
    };
  }

  /**
   * ===============================================
   * POLLING & HEALTH CHECK
   * ===============================================
   */

  @Poll({ interval: 5000 })
  async healthCheck() {
    if (!this.connected) {
      system.log.warn('Driver disconnected, attempting reconnect...');
      try {
        await this.socket.connect(config.host, config.port);
        this.connected = true;
        system.log.info('Reconnected successfully');
      } catch (error) {
        system.log.error('Reconnect failed:', error);
      }
    }
  }
}

export default ModbusTCPDriver;