import { WebService } from "../communication";
import { EventBus } from "../event-bus/index.ts";
import { DeviceService } from "../devices/DeviceService";
import { ControllerManager } from "../controllers/manager";

export class Dashboard {
  private static instance: Dashboard;
  private __webService = new WebService();
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
    await this.__webService.initialize();

    EventBus.getInstance().subscribe("device_value_changed", () => this.triggerUpdate());
    this.__webService.on("message", (data: any) => EventBus.getInstance().publish("dashboard_message", data));

    return this;
  }

  public async getDashboard(sync: string) {
    return new Promise((resolve) => {
      // Se já mudou, responde imediatamente
      if (sync !== this.__sync) {
        return resolve(this.buildDashboard());
      }

      const timeout = setTimeout(() => {
        // Timeout: responde com os dados atuais
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

  private buildDashboard() {
    const devices = DeviceService.getInstance().findAll().map(d => d.toDashboard());
    const controllers = ControllerManager.getInstance().findAll().map(c => c.toDashboard());
    return {
      sync: this.__sync,
      devices,
      controllers,
    };
  }

  // Chame este método sempre que o sync mudar
  private triggerUpdate() {
    this.__sync = Date.now().toString();
    for (const listener of this.__listeners) {
      listener();
    }
  }
}
