import { BaseService } from "../abstracts/BaseService";
import { WebService } from "../communication";
import type { Light } from "../light/Light";
import type { LightService } from "../light/LightService";

export type WebSocketResponse<T> = {
  type: string;
  code: number;
  payload: T[];
};

export type WebSocketDashboard = {
  id: number;
  name: string;
  lights: {
    id: number;
    name: string;
    type: "dimmer" | "switch" | "pulse";
    status: number;
  }[];
};

export class DashboardService extends BaseService {
  public webService: WebService;

  constructor(private lightService: LightService) {
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

  handleDashboardRegister() {
    const lights = this.lightsDashboard();

    const response: WebSocketResponse<WebSocketDashboard> = {
      type: "dashboard",
      code: 200,
      payload: [
        {
          id: 0,
          name: "Grupo 1 (Online)",
          lights,
        },
      ],
    };

    this.webService.broadcast(response);
  }

  async initialize(): Promise<this> {
    console.log("Iniciando DashboardService...");
    
    // Inicializa o WebService
    await this.webService.initialize();
    this.webService.on("open", () => this.handleDashboardRegister());

    this.lightService.on("onChange", (light: Light) => {
      this.handleLightChange(light);
    });

    console.log("DashboardService inicializado com sucesso!");
    return this;
  }

  private handleLightChange(light: Light) {
    const lightGroup = [
      {
        id: 0,
        name: "Grupo 1 (Online)",
        lights: this.lightsDashboard(),
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
