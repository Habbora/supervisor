import { Light } from "./Light";
import { BaseService } from "../abstracts/BaseService";
import { ControllerService } from "../controller/ControllerService";
import { DatabaseService } from "../database/DatabaseService";
import type { LightEntityDto } from "../database/types/LightEntity.dto";
import type { CreateLightDto } from "./types/CreateLight.dto";
import type { UpdateLightDto } from "./types/UpdateLight.dto";
import type { DeviceEndpoint } from "../../packages/class/device/DeviceEndpoint";

type CreateLightServiceDto = {
  databaseService: DatabaseService;
  deviceService: ControllerService;
};

export class LightService extends BaseService {
  private deviceService: ControllerService;
  private databaseService: DatabaseService;

  private lights: Map<string, Light> = new Map();

  constructor(config: CreateLightServiceDto) {
    super("LightService");
    this.deviceService = config.deviceService;
    this.databaseService = config.databaseService;
  }

  async initialize(): Promise<this> {
    try {
      console.log("Inicializando LightService...");
      await this.loadLights();
      await this.loadEndpointsEvents();
      console.log(`LightService inicializado com sucesso! ${this.lights.size} luzes encontradas.`);
    } catch (error) {
      console.error("Erro ao inicializar LightService:", error);
    }

    return this;
  }

  private async loadLights(): Promise<void> {
    const lights = await this.databaseService.find<LightEntityDto>("lights");
    lights.forEach((lightEntityDto) => {
      const light = Light.fromLightEntityDto(lightEntityDto);
      this.lights.set(light.name, light);
    });
  }
  // Melhoria futura: Mudar o evento para device service e pegar o valor do device.
  private async loadEndpointsEvents(): Promise<void> {
    let lightsWithEndpoints = [];

    this.lights.forEach((light) => {
      if (!light.lightEndpoint)
        return;

      const device = this.deviceService.getDevice(
        light.lightEndpoint.deviceName
      );
      if (!device)
        throw new Error(`Device ${light.lightEndpoint.deviceName} not found`);

      device.on("onChange", (data: DeviceEndpoint) => {
        if (!light.lightEndpoint) return;
        let endpoint =
          light.lightEndpoint.feedbackName ?? light.lightEndpoint.endpointName;

        if (data.name === endpoint) {
          light.value = light.lightEndpoint.feedbackIsInverted
            ? !data.value
            : data.value;
          light.value = data.value > 0 ? 0 : 1;
          this.emit("onChange", light);
        }
      });
    });
  }

  async destroy(): Promise<void> {
    // Limpa recursos das luzes
    this.lights.clear();
    await super.destroy();
  }

  async createLight(dto: CreateLightDto): Promise<Light> {
    const light = new Light(dto);
    await this.databaseService.create("lights", light.toEntityDto());
    return light;
  }

  async updateLight(lightName: string, dto: UpdateLightDto): Promise<Light> {
    const light = this.lights.get(lightName);
    if (!light) throw new Error(`Light ${lightName} not found`);
    await this.databaseService.update("lights", lightName, dto);
    return light;
  }

  public getLightByName(lightName: string): Light | undefined {
    return this.lights.get(lightName);
  }

  public getAllLights(): Light[] {
    return Array.from(this.lights.values());
  }

  public async setOn(lightName: string): Promise<boolean> {
    const light = this.lights.get(lightName);
    if (!light) throw new Error(`Light ${lightName} not found`);
    if (!light.lightEndpoint) throw new Error("No endpoint binding found");
    const device = this.deviceService.getDevice(light.lightEndpoint.deviceName);
    if (!device)
      throw new Error(`Device ${light.lightEndpoint.deviceName} not found`);
    if (light.lightEndpoint.type === "discrete") {
      device.setOutput(light.lightEndpoint.endpointName, 1);
    } else if (light.lightEndpoint.type === "pulse") {
      device.setPulse(light.lightEndpoint.endpointName);
    }
    return true;
  }
  public async setOff(lightName: string): Promise<boolean> {
    const light = this.lights.get(lightName);
    if (!light) throw new Error(`Light ${lightName} not found`);
    if (!light.lightEndpoint) throw new Error("No endpoint binding found");
    const device = this.deviceService.getDevice(light.lightEndpoint.deviceName);
    if (!device)
      throw new Error(`Device ${light.lightEndpoint.deviceName} not found`);
    if (light.lightEndpoint.type === "discrete") {
      device.setOutput(light.lightEndpoint.endpointName, 0);
    } else if (light.lightEndpoint.type === "pulse") {
      device.setPulse(light.lightEndpoint.endpointName);
    }
    return true;
  }

  public async setToggle(lightName: string): Promise<boolean> {
    const light = this.lights.get(lightName);
    if (!light) throw new Error(`Light ${lightName} not found`);
    if (!light.lightEndpoint) throw new Error("No endpoint binding found");
    const device = this.deviceService.getDevice(light.lightEndpoint.deviceName);
    if (!device)
      throw new Error(`Device ${light.lightEndpoint.deviceName} not found`);
    if (light.lightEndpoint.type === "discrete") {
      device.setOutput(light.lightEndpoint.endpointName, light.value ? 1 : 0);
    } else if (light.lightEndpoint.type === "pulse") {
      device.setPulse(light.lightEndpoint.endpointName);
    }

    return true;
  }
  public async setPulse(lightName: string): Promise<boolean> {
    const light = this.lights.get(lightName);
    if (!light) throw new Error(`Light ${lightName} not found`);
    if (!light.lightEndpoint) throw new Error("No endpoint binding found");
    const device = this.deviceService.getDevice(light.lightEndpoint.deviceName);
    if (!device)
      throw new Error(`Device ${light.lightEndpoint.deviceName} not found`);
    device.setPulse(light.lightEndpoint.endpointName);
    return true;
  }
}
