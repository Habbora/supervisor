/**
 * BindingMaster
 *
 * Classe genérica que representa o lado Master de um binding
 * Criado por drivers e recebe comandos de slaves (endpoints)
 */

export class BindingMaster {
  public readonly id: string;
  public readonly type: string;
  private slaves: Map<string, BindingSlaveConnection> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private closed = false;

  constructor(config: {
    id: string;
    type: string;
    [key: string]: any;
  }) {
    this.id = config.id;
    this.type = config.type;

    console.log(`[BindingMaster:${this.id}] Created (type: ${this.type})`);
  }

  /**
   * ===============================================
   * SLAVE MANAGEMENT
   * ===============================================
   */

  /**
   * Registra um slave conectado
   */
  registerSlave(slaveId: string, slave: BindingSlaveConnection) {
    if (this.closed) {
      throw new Error(`BindingMaster ${this.id} is closed`);
    }

    console.log(`[BindingMaster:${this.id}] Slave '${slaveId}' connected`);
    this.slaves.set(slaveId, slave);

    this.emit('slave:connected', { slaveId });
  }

  /**
   * Remove um slave
   */
  unregisterSlave(slaveId: string) {
    console.log(`[BindingMaster:${this.id}] Slave '${slaveId}' disconnected`);
    this.slaves.delete(slaveId);

    this.emit('slave:disconnected', { slaveId });
  }

  /**
   * Retorna lista de slaves conectados
   */
  getConnectedSlaves(): string[] {
    return Array.from(this.slaves.keys());
  }

  /**
   * Retorna quantidade de slaves
   */
  getSlaveCount(): number {
    return this.slaves.size;
  }

  /**
   * ===============================================
   * COMMAND ROUTING (Slave → Driver)
   * ===============================================
   */

  /**
   * Slave envia comando write
   * Master roteia para os event handlers do driver
   */
  async handleSlaveWrite(slaveId: string, operation: string, address: number, value: any): Promise<void> {
    console.log(`[BindingMaster:${this.id}] Slave '${slaveId}' write ${operation}:${address} = ${value}`);

    // Emite evento para o driver processar
    const eventName = `write:${operation}`;
    const handlers = this.eventHandlers.get(eventName) || [];

    for (const handler of handlers) {
      await handler({ slaveId, address, value });
    }
  }

  /**
   * Slave envia comando read
   * Master roteia para os event handlers do driver
   */
  async handleSlaveRead(slaveId: string, operation: string, address: number): Promise<any> {
    console.log(`[BindingMaster:${this.id}] Slave '${slaveId}' read ${operation}:${address}`);

    // Emite evento para o driver processar
    const eventName = `read:${operation}`;
    const handlers = this.eventHandlers.get(eventName) || [];

    if (handlers.length === 0) {
      throw new Error(`No handler for read:${operation}`);
    }

    // Chama primeiro handler e retorna resultado
    return await handlers[0]({ slaveId, address });
  }

  /**
   * ===============================================
   * BROADCAST (Master → Slaves)
   * ===============================================
   */

  /**
   * Envia atualização de estado para todos os slaves
   */
  broadcastState(operation: string, address: number, value: any) {
    console.log(`[BindingMaster:${this.id}] Broadcasting ${operation}:${address} = ${value}`);

    for (const [slaveId, slave] of this.slaves) {
      // Só envia se o slave estiver escutando este endereço
      if (slave.isListening(operation, address)) {
        slave.notifyStateUpdate(operation, address, value);
      }
    }
  }

  /**
   * Envia atualização para um slave específico
   */
  notifySlave(slaveId: string, operation: string, address: number, value: any) {
    const slave = this.slaves.get(slaveId);
    if (slave) {
      slave.notifyStateUpdate(operation, address, value);
    }
  }

  /**
   * ===============================================
   * EVENT HANDLERS (Driver → Master)
   * ===============================================
   */

  /**
   * Driver registra handlers para comandos
   */
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Emite evento interno
   */
  emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  /**
   * ===============================================
   * LIFECYCLE
   * ===============================================
   */

  /**
   * Fecha o binding e desconecta todos os slaves
   */
  async close() {
    if (this.closed) return;

    console.log(`[BindingMaster:${this.id}] Closing...`);

    // Desconecta todos os slaves
    for (const [slaveId, slave] of this.slaves) {
      slave.notifyMasterClosed();
    }

    this.slaves.clear();
    this.eventHandlers.clear();
    this.closed = true;

    console.log(`[BindingMaster:${this.id}] Closed`);
  }

  /**
   * Verifica se está fechado
   */
  isClosed(): boolean {
    return this.closed;
  }

  /**
   * ===============================================
   * INFO
   * ===============================================
   */

  getInfo() {
    return {
      id: this.id,
      type: this.type,
      slaveCount: this.slaves.size,
      slaves: this.getConnectedSlaves(),
      closed: this.closed,
    };
  }
}

/**
 * Interface da conexão do Slave (do ponto de vista do Master)
 */
export interface BindingSlaveConnection {
  slaveId: string;

  /**
   * Verifica se o slave está escutando este endereço
   */
  isListening(operation: string, address: number): boolean;

  /**
   * Notifica slave sobre atualização de estado
   */
  notifyStateUpdate(operation: string, address: number, value: any): void;

  /**
   * Notifica slave que o master foi fechado
   */
  notifyMasterClosed(): void;
}
