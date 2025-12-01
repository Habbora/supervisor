/**
 * BindingSlave
 *
 * Classe genérica que representa o lado Slave de um binding
 * Criado por endpoints e se conecta a um master (driver)
 */

export class BindingSlave {
  public readonly endpointId: string;
  public readonly endpointType: string;
  private masterId: string | null = null;
  private master: BindingMasterConnection | null = null;
  private connected = false;
  private eventHandlers: Map<string, Function[]> = new Map();
  private listeningAddresses: Map<string, Set<number>> = new Map();

  constructor(config: {
    endpointId: string;
    endpointType: string;
    [key: string]: any;
  }) {
    this.endpointId = config.endpointId;
    this.endpointType = config.endpointType;

    console.log(`[BindingSlave:${this.endpointId}] Created (type: ${this.endpointType})`);
  }

  /**
   * ===============================================
   * CONNECTION MANAGEMENT
   * ===============================================
   */

  /**
   * Conecta a um binding master
   */
  async connect(masterId: string): Promise<void> {
    if (this.connected) {
      throw new Error(`BindingSlave ${this.endpointId} already connected to ${this.masterId}`);
    }

    console.log(`[BindingSlave:${this.endpointId}] Connecting to master '${masterId}'...`);

    try {
      // Busca o master no system
      this.master = await system.bindings.getMaster(masterId);
      if (!this.master) {
        throw new Error(`Binding master '${masterId}' not found`);
      }

      // Registra-se no master
      await this.master.registerSlave(this.endpointId, this);

      this.masterId = masterId;
      this.connected = true;

      console.log(`[BindingSlave:${this.endpointId}] Connected to '${masterId}'`);

      // Emite evento de conexão
      this.emit('connected', { masterId });
    } catch (error) {
      console.error(`[BindingSlave:${this.endpointId}] Connection failed:`, error);
      throw error;
    }
  }

  /**
   * Desconecta do master atual
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;

    console.log(`[BindingSlave:${this.endpointId}] Disconnecting from '${this.masterId}'...`);

    // Remove-se do master
    if (this.master) {
      await this.master.unregisterSlave(this.endpointId);
    }

    const previousMasterId = this.masterId;
    this.master = null;
    this.masterId = null;
    this.connected = false;

    console.log(`[BindingSlave:${this.endpointId}] Disconnected from '${previousMasterId}'`);

    // Emite evento
    this.emit('disconnected', { previousMasterId });
  }

  /**
   * Troca de binding master dinamicamente
   */
  async switchMaster(newMasterId: string): Promise<void> {
    console.log(`[BindingSlave:${this.endpointId}] Switching to '${newMasterId}'...`);

    const previousMasterId = this.masterId;

    // Desconecta do atual
    if (this.connected) {
      await this.disconnect();
    }

    // Conecta ao novo
    await this.connect(newMasterId);

    this.emit('master:switched', { previousMasterId, newMasterId });
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Retorna o ID do master atual
   */
  getMasterId(): string | null {
    return this.masterId;
  }

  /**
   * ===============================================
   * COMMANDS (Slave → Master)
   * ===============================================
   */

  /**
   * Envia comando write ao master
   */
  async write(operation: string, address: number, value: any): Promise<void> {
    if (!this.connected) {
      throw new Error(`BindingSlave ${this.endpointId} not connected`);
    }

    console.log(`[BindingSlave:${this.endpointId}] Write ${operation}:${address} = ${value}`);

    // Envia ao master
    await this.master!.handleWrite(this.endpointId, operation, address, value);
  }

  /**
   * Envia comando read ao master
   */
  async read(operation: string, address: number): Promise<any> {
    if (!this.connected) {
      throw new Error(`BindingSlave ${this.endpointId} not connected`);
    }

    console.log(`[BindingSlave:${this.endpointId}] Read ${operation}:${address}`);

    // Lê do master
    const value = await this.master!.handleRead(this.endpointId, operation, address);
    return value;
  }

  /**
   * ===============================================
   * STATE LISTENING (Master → Slave)
   * ===============================================
   */

  /**
   * Registra interesse em receber updates de um endereço
   */
  listenTo(operation: string, address: number) {
    if (!this.listeningAddresses.has(operation)) {
      this.listeningAddresses.set(operation, new Set());
    }

    this.listeningAddresses.get(operation)!.add(address);

    console.log(`[BindingSlave:${this.endpointId}] Listening to ${operation}:${address}`);
  }

  /**
   * Para de escutar um endereço
   */
  unlistenTo(operation: string, address: number) {
    const addresses = this.listeningAddresses.get(operation);
    if (addresses) {
      addresses.delete(address);
    }
  }

  /**
   * Verifica se está escutando um endereço
   */
  isListening(operation: string, address: number): boolean {
    const addresses = this.listeningAddresses.get(operation);
    return addresses ? addresses.has(address) : false;
  }

  /**
   * Master notifica atualização de estado
   * (Chamado pelo master quando há polling ou evento)
   */
  notifyStateUpdate(operation: string, address: number, value: any): void {
    console.log(`[BindingSlave:${this.endpointId}] State update ${operation}:${address} = ${value}`);

    // Emite evento para o endpoint
    this.emit('state:updated', {
      operation,
      address,
      value,
    });
  }

  /**
   * Master notifica que foi fechado
   */
  notifyMasterClosed(): void {
    console.log(`[BindingSlave:${this.endpointId}] Master closed`);

    this.master = null;
    this.masterId = null;
    this.connected = false;

    this.emit('master:closed', {});
  }

  /**
   * ===============================================
   * EVENT HANDLERS
   * ===============================================
   */

  /**
   * Endpoint registra handler para eventos
   */
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove handler
   */
  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emite evento interno
   */
  emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[BindingSlave:${this.endpointId}] Event handler error:`, error);
      }
    }
  }

  /**
   * ===============================================
   * LIFECYCLE
   * ===============================================
   */

  /**
   * Fecha o slave e desconecta
   */
  async close() {
    console.log(`[BindingSlave:${this.endpointId}] Closing...`);

    if (this.connected) {
      await this.disconnect();
    }

    this.eventHandlers.clear();
    this.listeningAddresses.clear();

    console.log(`[BindingSlave:${this.endpointId}] Closed`);
  }

  /**
   * ===============================================
   * INFO
   * ===============================================
   */

  getInfo() {
    return {
      endpointId: this.endpointId,
      endpointType: this.endpointType,
      connected: this.connected,
      masterId: this.masterId,
      listeningTo: Array.from(this.listeningAddresses.entries()).map(([op, addrs]) => ({
        operation: op,
        addresses: Array.from(addrs),
      })),
    };
  }
}

/**
 * Interface da conexão com o Master (do ponto de vista do Slave)
 */
export interface BindingMasterConnection {
  masterId: string;

  /**
   * Registra slave no master
   */
  registerSlave(slaveId: string, slave: any): Promise<void>;

  /**
   * Remove slave do master
   */
  unregisterSlave(slaveId: string): Promise<void>;

  /**
   * Slave envia comando write
   */
  handleWrite(slaveId: string, operation: string, address: number, value: any): Promise<void>;

  /**
   * Slave envia comando read
   */
  handleRead(slaveId: string, operation: string, address: number): Promise<any>;
}
