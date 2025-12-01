/**
 * Modbus TCP Driver
 *
 * Driver para comunicação com dispositivos Modbus TCP
 * Importa: socketTcp (host, port das configs)
 * Exporta: SwitchService, InputService
 */

import {
  Driver,
  UseNetwork,
  SwitchService,
  InputService,
  OnInit,
  OnClose,
  OnConnect,
  OnDisconnect,
  OnError,
  Poll,
} from './service-types';

@Driver({
  name: 'Modbus TCP Driver',
  version: '1.0.0',
  description: 'Driver para comunicação Modbus TCP/IP',
})
@UseNetwork({
  type: 'tcp',
  defaultPort: 502,
})
export class ModbusTCPDriver {
  private socket!: any;
  private connected = false;

  /**
   * Inicialização do driver
   * Cria socket TCP usando host e port do config
   */
  @OnInit()
  async initialize() {
    system.logger.info('Initializing Modbus TCP Driver...');

    // Cria socket TCP com config injetado
    this.socket = system.network.createTcpSocket({
      host: config.host,
      port: config.port || 502,
      timeout: config.timeout || 5000,
    });

    // Event handlers
    this.socket.on('data', this.handleData.bind(this));
    this.socket.on('error', this.handleSocketError.bind(this));
    this.socket.on('close', this.handleSocketClose.bind(this));

    // Conecta
    await this.socket.connect();
  }

  /**
   * Cleanup ao parar o driver
   */
  @OnClose()
  async cleanup() {
    system.logger.info('Closing Modbus TCP Driver...');
    if (this.socket) {
      await this.socket.disconnect();
    }
  }

  /**
   * Callback quando conecta
   */
  @OnConnect()
  async onConnect() {
    this.connected = true;
    system.logger.info(`Connected to Modbus TCP at ${config.host}:${config.port}`);
    system.events.emit('driver:connected', {
      host: config.host,
      port: config.port,
    });
  }

  /**
   * Callback quando desconecta
   */
  @OnDisconnect()
  async onDisconnect() {
    this.connected = false;
    system.logger.warn('Disconnected from Modbus TCP');
    system.events.emit('driver:disconnected', {});
  }

  /**
   * Handler de erros
   */
  @OnError()
  async handleError(error: Error) {
    system.logger.error('Modbus TCP Error:', error);
    system.events.emit('driver:error', { error: error.message });

    // Tenta reconectar após 5 segundos
    system.scheduler.setTimeout(() => {
      this.reconnect();
    }, 5000);
  }

  /**
   * Exporta SwitchService (16 switches começando no endereço 0)
   */
  @SwitchService({
    id: 'switch_{{address}}',
    count: 16,
    addressStart: 0,
  })
  async switches() {
    return {
      setOn: async (address: number) => {
        system.logger.debug(`Switch ${address}: ON`);
        const cmd = system.modbus.writeCoil(address, true);
        await this.socket.send(cmd);

        // Emite evento de mudança de estado
        system.events.emit(`switch:${address}:state`, { on: true });
      },

      setOff: async (address: number) => {
        system.logger.debug(`Switch ${address}: OFF`);
        const cmd = system.modbus.writeCoil(address, false);
        await this.socket.send(cmd);

        // Emite evento de mudança de estado
        system.events.emit(`switch:${address}:state`, { on: false });
      },

      state: {
        on: false,
      },
    };
  }

  /**
   * Exporta InputService (8 inputs começando no endereço 100)
   */
  @InputService({
    id: 'input_{{address}}',
    count: 8,
    addressStart: 100,
  })
  async inputs() {
    return {
      read: async (address: number) => {
        system.logger.debug(`Reading input ${address}`);
        const cmd = system.modbus.readCoil(address);
        const response = await this.socket.sendAndWait(cmd);
        const value = system.modbus.parseCoil(response);

        // Emite evento com valor lido
        system.events.emit(`input:${address}:value`, { value });

        return value;
      },

      state: {
        value: false,
      },
    };
  }

  /**
   * Polling automático para atualizar estados
   * Executa a cada 1 segundo
   */
  @Poll({ interval: 1000 })
  async updateStates() {
    if (!this.connected) return;

    try {
      // Lê todos os switches (0-15)
      const switchStates = await this.readCoils(0, 16);
      switchStates.forEach((state, index) => {
        system.events.emit(`switch:${index}:state`, { on: state });
      });

      // Lê todos os inputs (100-107)
      const inputStates = await this.readCoils(100, 8);
      inputStates.forEach((state, index) => {
        const address = 100 + index;
        system.events.emit(`input:${address}:value`, { value: state });
      });
    } catch (error) {
      system.logger.error('Polling error:', error);
    }
  }

  /**
   * Helpers privados
   */

  private async readCoils(start: number, count: number): Promise<boolean[]> {
    const cmd = system.modbus.readCoils(start, count);
    const response = await this.socket.sendAndWait(cmd);
    return system.modbus.parseCoils(response, count);
  }

  private handleData(data: Buffer) {
    system.logger.debug('Received data:', data);
  }

  private handleSocketError(error: Error) {
    this.handleError(error);
  }

  private handleSocketClose() {
    this.onDisconnect();
  }

  private async reconnect() {
    system.logger.info('Attempting to reconnect...');
    try {
      await this.socket.connect();
    } catch (error) {
      system.logger.error('Reconnect failed:', error);
      // Tenta novamente após 5 segundos
      system.scheduler.setTimeout(() => this.reconnect(), 5000);
    }
  }
}

/**
 * Export default para o compilador
 */
export default ModbusTCPDriver;
