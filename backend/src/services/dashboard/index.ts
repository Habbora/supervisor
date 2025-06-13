import { BaseService } from "../abstracts/BaseService";
import { WebService } from "../communication";
import type { HydraulicService } from "../hydraulic";
import type { Light } from "../light/Light";
import type { LightService } from "../light/LightService";
import type { WebSocketDashboard, WebSocketResponse } from "./types/websocket";
import type { DeviceEventData } from "../devices/types/device.type";
import type { DeviceManager } from "../devices/manager";

export class DashboardService extends BaseService {
  public webService: WebService;

  constructor(
    private lightService: LightService,
    private hydraulicService: HydraulicService
  ) {
    super("DashboardService");
    this.webService = new WebService();
  }

  private lightsDashboard() {
    return this.lightService
      .getAllLights()
      .map((light) => DashboardService.fromLight(light))
      .map((light, index) => ({
        id: index,
        name: light.name,
        type: "switch" as const,
        status: light.value ?? 0,
      }));
  }

  private levelDashboard() {
    const deviceManager: DeviceManager = (global as any).deviceManager;
    const levels = deviceManager.getDevices().map((device) => {
      return {
        id: device.id,
        name: device.name,
        value: device.value ?? 0,
      };
    });

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

    this.lightService.on("onChange", (light: Light) => {
      this.handleLightChange(light);
    });

    const deviceManager: DeviceManager = (global as any).deviceManager;
    deviceManager.on("valueChanged", (data: DeviceEventData) => {
      this.handleDeviceChange();
    });

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
