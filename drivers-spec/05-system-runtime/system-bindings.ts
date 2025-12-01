/**
 * System Bindings Manager
 *
 * Gerencia todos os bindings masters e slaves do sistema
 * Faz o roteamento de mensagens entre eles
 */

import { BindingMaster, BindingSlaveConnection } from './binding-master';
import { BindingSlave, BindingMasterConnection } from './binding-slave';

export class SystemBindingsManager {
  private masters: Map<string, BindingMaster> = new Map();
  private slaves: Map<string, BindingSlave> = new Map();

  /**
   * ===============================================
   * BINDING MASTER MANAGEMENT
   * ===============================================
   */

  /**
   * Cria um novo Binding Master
   * Chamado por drivers
   */
  createBindingMaster(type: string, config: any): BindingMaster {
    const master = new BindingMaster({
      type,
      ...config,
    });

    // Registra no sistema
    this.masters.set(master.id, master);

    console.log(`[System] Binding master '${master.id}' (${type}) created`);

    return master;
  }

  /**
   * Remove um Binding Master
   */
  async removeBindingMaster(masterId: string): Promise<void> {
    const master = this.masters.get(masterId);
    if (!master) return;

    console.log(`[System] Removing binding master '${masterId}'...`);

    // Fecha o master (desconecta todos os slaves)
    await master.close();

    this.masters.delete(masterId);
  }

  /**
   * Retorna um Binding Master
   */
  getMaster(masterId: string): BindingMaster | undefined {
    return this.masters.get(masterId);
  }

  /**
   * Lista todos os masters
   */
  listMasters(): BindingMaster[] {
    return Array.from(this.masters.values());
  }

  /**
   * ===============================================
   * BINDING SLAVE MANAGEMENT
   * ===============================================
   */

  /**
   * Cria um novo Binding Slave
   * Chamado por endpoints
   */
  createBindingSlave(config: {
    endpointId: string;
    endpointType: string;
    [key: string]: any;
  }): BindingSlave {
    const slave = new BindingSlave(config);

    // Registra no sistema
    this.slaves.set(config.endpointId, slave);

    console.log(`[System] Binding slave '${config.endpointId}' (${config.endpointType}) created`);

    return slave;
  }

  /**
   * Remove um Binding Slave
   */
  async removeBindingSlave(slaveId: string): Promise<void> {
    const slave = this.slaves.get(slaveId);
    if (!slave) return;

    console.log(`[System] Removing binding slave '${slaveId}'...`);

    // Fecha o slave (desconecta do master)
    await slave.close();

    this.slaves.delete(slaveId);
  }

  /**
   * Retorna um Binding Slave
   */
  getSlave(slaveId: string): BindingSlave | undefined {
    return this.slaves.get(slaveId);
  }

  /**
   * Lista todos os slaves
   */
  listSlaves(): BindingSlave[] {
    return Array.from(this.slaves.values());
  }

  /**
   * ===============================================
   * CONNECTION MANAGEMENT
   * ===============================================
   */

  /**
   * Conecta um slave a um master
   */
  async connectSlaveToMaster(slaveId: string, masterId: string): Promise<void> {
    const slave = this.slaves.get(slaveId);
    const master = this.masters.get(masterId);

    if (!slave) {
      throw new Error(`Slave '${slaveId}' not found`);
    }

    if (!master) {
      throw new Error(`Master '${masterId}' not found`);
    }

    console.log(`[System] Connecting slave '${slaveId}' to master '${masterId}'...`);

    await slave.connect(masterId);
  }

  /**
   * Desconecta um slave do seu master
   */
  async disconnectSlave(slaveId: string): Promise<void> {
    const slave = this.slaves.get(slaveId);

    if (!slave) {
      throw new Error(`Slave '${slaveId}' not found`);
    }

    console.log(`[System] Disconnecting slave '${slaveId}'...`);

    await slave.disconnect();
  }

  /**
   * Move um slave de um master para outro
   */
  async switchSlaveMaster(slaveId: string, newMasterId: string): Promise<void> {
    const slave = this.slaves.get(slaveId);
    const newMaster = this.masters.get(newMasterId);

    if (!slave) {
      throw new Error(`Slave '${slaveId}' not found`);
    }

    if (!newMaster) {
      throw new Error(`Master '${newMasterId}' not found`);
    }

    console.log(`[System] Switching slave '${slaveId}' to master '${newMasterId}'...`);

    await slave.switchMaster(newMasterId);
  }

  /**
   * ===============================================
   * QUERY / INFO
   * ===============================================
   */

  /**
   * Lista slaves conectados a um master
   */
  getSlavesForMaster(masterId: string): string[] {
    const master = this.masters.get(masterId);
    if (!master) return [];

    return master.getConnectedSlaves();
  }

  /**
   * Retorna master de um slave
   */
  getMasterForSlave(slaveId: string): string | null {
    const slave = this.slaves.get(slaveId);
    if (!slave) return null;

    return slave.getMasterId();
  }

  /**
   * Estatísticas do sistema
   */
  getStats() {
    return {
      totalMasters: this.masters.size,
      totalSlaves: this.slaves.size,
      masters: Array.from(this.masters.values()).map(m => ({
        id: m.id,
        type: m.type,
        slaveCount: m.getSlaveCount(),
        slaves: m.getConnectedSlaves(),
      })),
      slaves: Array.from(this.slaves.values()).map(s => ({
        id: s.endpointId,
        type: s.endpointType,
        connected: s.isConnected(),
        masterId: s.getMasterId(),
      })),
    };
  }

  /**
   * ===============================================
   * LIFECYCLE
   * ===============================================
   */

  /**
   * Fecha todos os bindings
   */
  async closeAll(): Promise<void> {
    console.log('[System] Closing all bindings...');

    // Fecha todos os masters (isso desconecta os slaves)
    for (const master of this.masters.values()) {
      await master.close();
    }

    // Fecha todos os slaves
    for (const slave of this.slaves.values()) {
      await slave.close();
    }

    this.masters.clear();
    this.slaves.clear();

    console.log('[System] All bindings closed');
  }
}

/**
 * Adapter que conecta BindingMaster e BindingSlave
 * Implementa as interfaces que cada lado espera
 */
export class BindingAdapter {
  /**
   * Cria um adapter do Master para o Slave usar
   */
  static createMasterConnectionForSlave(master: BindingMaster): BindingMasterConnection {
    return {
      masterId: master.id,

      async registerSlave(slaveId: string, slave: any) {
        master.registerSlave(slaveId, slave);
      },

      async unregisterSlave(slaveId: string) {
        master.unregisterSlave(slaveId);
      },

      async handleWrite(slaveId: string, operation: string, address: number, value: any) {
        await master.handleSlaveWrite(slaveId, operation, address, value);
      },

      async handleRead(slaveId: string, operation: string, address: number) {
        return await master.handleSlaveRead(slaveId, operation, address);
      },
    };
  }

  /**
   * Cria um adapter do Slave para o Master usar
   */
  static createSlaveConnectionForMaster(slave: BindingSlave): BindingSlaveConnection {
    return {
      slaveId: slave.endpointId,

      isListening(operation: string, address: number): boolean {
        return slave.isListening(operation, address);
      },

      notifyStateUpdate(operation: string, address: number, value: any): void {
        slave.notifyStateUpdate(operation, address, value);
      },

      notifyMasterClosed(): void {
        slave.notifyMasterClosed();
      },
    };
  }
}

/**
 * Instância global do sistema
 */
export const systemBindings = new SystemBindingsManager();
