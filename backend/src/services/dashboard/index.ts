import { BaseService } from "../abstracts/BaseService";
import { WebService } from "../communication";
import type { LightService } from "../light/LightService";
import type { WebSocketDashboard, WebSocketResponse } from "./types/websocket";
import { DeviceManager } from "../devices/DeviceManager";
import { EventBus } from "../EventBus";
import { Light } from "../devices/light";
import { Level } from "../devices/Level";

export class DashboardService extends BaseService {
  public webService: WebService;

  constructor(
    private lightService: LightService,
  ) {
    super("DashboardService");
    this.webService = new WebService();
  }

  private lightsDashboard() {
    const deviceManager: DeviceManager = DeviceManager.getInstance();
    console.log(deviceManager.getDevices());

    const lights = Array.from(deviceManager.getDevices().values()).map((device) => {
      if (device instanceof Light) {
        return {
          id: parseInt(device.id) || 0,
          name: device.name,
          type: "switch" as const,
          status: device.value ?? 0,
        };
      }
    }).filter((light) => light !== undefined);

    return lights;
  }

  private levelDashboard() {
    const deviceManager: DeviceManager = DeviceManager.getInstance();
    const levels = Array.from(deviceManager.getDevices().values()).map((device) => {
      if (device instanceof Level) {
        return {
          id: device.id,
          name: device.name,
          value: device.value ?? 0,
          type: "switch",
        };
      }
    }).filter((level) => level !== undefined);

    return levels;
  }

  handleDashboardRegister() {
    const lights = this.lightsDashboard();
    const levels = this.levelDashboard();

    const response: WebSocketResponse<WebSocketDashboard> = {
      type: "dashboard",
      code: 200,
      payload: [
        {
          id: 0,
          name: "Grupo 1 (Online)",
          lights,
          levels,
        },
      ],
    };

    this.webService.broadcast(response);
  }

  async initialize(): Promise<this> {
    console.log("Iniciando DashboardService...");

    // Inicializa o WebService
    await this.webService.initialize();
    this.webService.on("open", () => this.handleDeviceChange());

    EventBus.getInstance().subscribe("device_value_changed", this.handleDeviceChange);

    console.log("DashboardService inicializado com sucesso!");
    return this;
  }

  private handleDeviceChange() {
    const groups = [
      {
        id: 0,
        name: "Grupo 1 (Online)",
        lights: this.lightsDashboard(),
        levels: this.levelDashboard(),
      },
    ];

    const data: WebSocketResponse<WebSocketDashboard> = {
      type: "dashboard",
      code: 200,
      payload: groups,
    };

    this.webService.broadcast(data);
  }


  private handleLightChange(light: Light) {
    const lightGroup = [
      {
        id: 0,
        name: "Grupo 1 (Online)",
        lights: this.lightsDashboard(),
        levels: this.levelDashboard(),
      },
    ];
    const data: WebSocketResponse<WebSocketDashboard> = {
      type: "dashboard",
      code: 200,
      payload: lightGroup,
    };
    this.webService.broadcast(data);
  }

  static fromLight(light: Light) {
    return {
      name: light.name,
      value: light.value,
    };
  }
}
