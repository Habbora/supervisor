import { EventBus } from "../event-bus/index.ts";
import { LightService } from "../../features/lights/LightService";
import { ControllerManager } from "../../controllers/controller.manager";

/**
 * DASHBOARD - SIMPLIFICADO
 *
 * - Long-polling para atualizações em tempo real
 * - Agrega dados de LightService e ControllerManager
 * - Simples e eficiente
 */
export class Dashboard {
  private static instance: Dashboard;
  private __sync: string = Date.now().toString();
  private __listeners: (() => void)[] = [];

  constructor() {
    this.initialize();
  }

  public static getInstance(): Dashboard {
    if (!Dashboard.instance) {
      Dashboard.instance = new Dashboard();
    }
    return Dashboard.instance;
  }

  async initialize(): Promise<this> {
    EventBus.getInstance().subscribe("light_value_changed", () => this.triggerUpdate());
    EventBus.getInstance().subscribe("light_created", () => this.triggerUpdate());
    EventBus.getInstance().subscribe("light_updated", () => this.triggerUpdate());
    EventBus.getInstance().subscribe("light_deleted", () => this.triggerUpdate());
    EventBus.getInstance().subscribe("controller_connected", () => this.triggerUpdate());
    EventBus.getInstance().subscribe("controller_disconnected", () => this.triggerUpdate());

    return this;
  }

  /**
   * Cleanup
   */
  public shutdown() {
    EventBus.getInstance().unsubscribe("light_value_changed", () => this.triggerUpdate());
    EventBus.getInstance().unsubscribe("light_created", () => this.triggerUpdate());
    EventBus.getInstance().unsubscribe("light_updated", () => this.triggerUpdate());
    EventBus.getInstance().unsubscribe("light_deleted", () => this.triggerUpdate());
    EventBus.getInstance().unsubscribe("controller_connected", () => this.triggerUpdate());
    EventBus.getInstance().unsubscribe("controller_disconnected", () => this.triggerUpdate());
    this.__listeners = [];
  }

  /**
   * Long-polling: aguarda mudanças ou timeout de 5s
   */
  public async getDashboard(sync: string) {
    return new Promise((resolve) => {
      // Se já mudou, responde imediatamente
      if (sync !== this.__sync) {
        return resolve(this.buildDashboard());
      }

      // Timeout de 5 segundos
      const timeout = setTimeout(() => {
        resolve(this.buildDashboard());
        this.__listeners = this.__listeners.filter(l => l !== notify);
      }, 5000);

      const notify = () => {
        clearTimeout(timeout);
        resolve(this.buildDashboard());
        this.__listeners = this.__listeners.filter(l => l !== notify);
      };

      // Registra o listener
      this.__listeners.push(notify);
    });
  }

  /**
   * Constrói os dados do dashboard
   */
  private buildDashboard() {
    // Lights
    const lights = LightService.getInstance().findAll().map(light => ({
      id: light.id,
      name: light.name,
      type: 'light',
      isOnline: light.isOnline,
      value: light.value,
      controllerId: light.controllerId,
      endpointName: light.endpointName,
      lastUpdate: light.lastUpdate.toISOString()
    }));

    // Controllers
    const controllers = ControllerManager.getInstance().findAll().map(c => c.toDashboard());

    // Stats
    const stats = {
      lights: {
        total: lights.length,
        online: lights.filter(l => l.isOnline).length,
        offline: lights.filter(l => !l.isOnline).length
      },
      controllers: {
        total: controllers.length,
        online: controllers.filter(c => c.status.isConnected).length,
        offline: controllers.filter(c => !c.status.isConnected).length
      }
    };

    return {
      sync: this.__sync,
      lights,
      devices: lights, // Compatibilidade com frontend
      controllers,
      stats
    };
  }

  /**
   * Invalida cache e notifica listeners
   */
  private triggerUpdate() {
    this.__sync = Date.now().toString();
    for (const listener of this.__listeners) {
      listener();
    }
  }


}
