/**
 * Endpoint DigitalOutput - Dynamic Binding
 *
 * Endpoint que pode conectar/desconectar de bindings dinamicamente
 * Pode trocar de binding em runtime
 */

import { Endpoint, OnInit, OnClose } from '../03-binding-architecture/binding-architecture';
import { DigitalOutput } from '../02-endpoint-types/DO-DI-AO-AI';

@Endpoint({
  name: 'Digital Output (Dynamic)',
  type: 'DigitalOutput',
  description: 'Saída digital com binding dinâmico',
})
export class DOEndpoint implements DigitalOutput {
  id!: string | number;
  address!: number;

  // Binding slave (pode estar conectado ou não)
  private bindingSlave: any | null = null;
  private connected = false;

  // Estado
  state = {
    value: false,
    lastChanged: undefined as Date | undefined,
  };

  /**
   * ===============================================
   * LIFECYCLE
   * ===============================================
   */

  @OnInit()
  async initialize() {
    system.log.info(`[DO:${this.id}] Initializing endpoint...`);

    // Configuração do endpoint
    this.address = config.address;

    // Cria binding slave (NÃO conectado ainda)
    this.bindingSlave = system.createBindingSlave({
      endpointId: this.id,
      endpointType: 'DigitalOutput',
    });

    // Escuta eventos do binding
    this.setupBindingListeners();

    // Se tiver bindingMasterId na config, conecta automaticamente
    if (config.bindingMasterId) {
      await this.connectToBinding(config.bindingMasterId);
    } else {
      system.log.info(`[DO:${this.id}] Created but not connected to any binding`);
    }
  }

  @OnClose()
  async cleanup() {
    system.log.info(`[DO:${this.id}] Closing...`);

    if (this.bindingSlave) {
      await this.disconnect();
    }
  }

  /**
   * ===============================================
   * BINDING MANAGEMENT
   * ===============================================
   */

  /**
   * Conecta a um binding master
   */
  async connectToBinding(bindingMasterId: string) {
    system.log.info(`[DO:${this.id}] Connecting to binding '${bindingMasterId}'...`);

    // Desconecta do binding anterior (se tiver)
    if (this.connected) {
      await this.disconnect();
    }

    try {
      // Conecta ao binding master
      await this.bindingSlave.connect(bindingMasterId);
      this.connected = true;

      system.log.info(`[DO:${this.id}] Connected to '${bindingMasterId}'`);

      // Emite evento
      system.events.emit(`endpoint:${this.id}:connected`, {
        bindingMasterId,
      });

      // Atualiza estado inicial
      await this.updateState();
    } catch (error) {
      system.log.error(`[DO:${this.id}] Connection failed:`, error);
      throw error;
    }
  }

  /**
   * Desconecta do binding atual
   */
  async disconnect() {
    if (!this.connected) return;

    system.log.info(`[DO:${this.id}] Disconnecting...`);

    await this.bindingSlave.disconnect();
    this.connected = false;

    system.events.emit(`endpoint:${this.id}:disconnected`, {});
  }

  /**
   * Troca de binding dinamicamente
   */
  async switchBinding(newBindingMasterId: string) {
    system.log.info(`[DO:${this.id}] Switching to binding '${newBindingMasterId}'...`);

    await this.connectToBinding(newBindingMasterId);
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retorna o binding master atual
   */
  getCurrentBinding(): string | null {
    return this.bindingSlave?.getMasterId() || null;
  }

  /**
   * ===============================================
   * BINDING LISTENERS
   * ===============================================
   */

  private setupBindingListeners() {
    // Evento de conexão estabelecida
    this.bindingSlave.on('connected', (data: any) => {
      system.log.info(`[DO:${this.id}] Binding connected:`, data.masterId);
    });

    // Evento de desconexão
    this.bindingSlave.on('disconnected', () => {
      system.log.warn(`[DO:${this.id}] Binding disconnected`);
      this.connected = false;
    });

    // Evento de erro
    this.bindingSlave.on('error', (error: any) => {
      system.log.error(`[DO:${this.id}] Binding error:`, error);
    });

    // Atualização de estado vinda do master (polling)
    this.bindingSlave.on('state:updated', (data: { value: boolean }) => {
      this.state.value = data.value;
      this.state.lastChanged = new Date();

      system.events.emit(`endpoint:${this.id}:state:changed`, {
        value: data.value,
      });
    });
  }

  /**
   * ===============================================
   * DIGITAL OUTPUT COMMANDS
   * ===============================================
   */

  async setOn(): Promise<void> {
    if (!this.connected) {
      throw new Error(`Endpoint ${this.id} not connected to any binding`);
    }

    system.log.info(`[DO:${this.id}] Setting ON (address ${this.address})`);

    // Envia comando ao binding master via slave
    await this.bindingSlave.write('coil', this.address, true);

    // Atualiza estado local
    this.state.value = true;
    this.state.lastChanged = new Date();

    // Emite evento
    system.events.emit(`endpoint:${this.id}:changed`, {
      value: true,
    });
  }

  async setOff(): Promise<void> {
    if (!this.connected) {
      throw new Error(`Endpoint ${this.id} not connected to any binding`);
    }

    system.log.info(`[DO:${this.id}] Setting OFF (address ${this.address})`);

    await this.bindingSlave.write('coil', this.address, false);

    this.state.value = false;
    this.state.lastChanged = new Date();

    system.events.emit(`endpoint:${this.id}:changed`, {
      value: false,
    });
  }

  async toggle(): Promise<void> {
    if (this.state.value) {
      await this.setOff();
    } else {
      await this.setOn();
    }
  }

  async read(): Promise<boolean> {
    if (!this.connected) {
      throw new Error(`Endpoint ${this.id} not connected to any binding`);
    }

    system.log.debug(`[DO:${this.id}] Reading (address ${this.address})`);

    // Lê do binding master
    const value = await this.bindingSlave.read('coil', this.address);

    // Atualiza estado
    this.state.value = value;
    this.state.lastChanged = new Date();

    return value;
  }

  /**
   * ===============================================
   * HELPERS
   * ===============================================
   */

  /**
   * Atualiza estado lendo do binding
   */
  private async updateState() {
    if (!this.connected) return;

    try {
      await this.read();
    } catch (error) {
      system.log.error(`[DO:${this.id}] Failed to update state:`, error);
    }
  }

  /**
   * Pulso (liga por X ms e depois desliga)
   */
  async pulse(duration = 250): Promise<void> {
    await this.setOn();
    await system.time.setTimeout(async () => {
      await this.setOff();
    }, duration);
  }

  /**
   * Retorna informações do endpoint
   */
  getInfo() {
    return {
      id: this.id,
      type: 'DigitalOutput',
      address: this.address,
      connected: this.connected,
      bindingMaster: this.getCurrentBinding(),
      state: this.state,
    };
  }
}

export default DOEndpoint;
