import { BaseService } from "../abstracts/BaseService";
import type { DatabaseService } from "../database";
import type { DeviceService } from "../controller";

type ClimateEndpointEntityDto = {
  type: "ir";
  deviceName: string;
  endpointName: string;
};

type ClimateEntityDto = {
  name: string;
  mode: string[];
  setpoint: number[];
  fan: string[];
  swing: string[];
  commands: { [key: string]: string };
  endpoint: ClimateEndpointEntityDto;
}

class Climate {
  public mode: string[] = [];
  public setpoint: number[] = [];
  public fan: string[] = [];
  public swing: string[] = [];
  public commands: { [key: string]: string } = {};

  public isPowerOn: boolean = false;

  constructor(
    public name: string,
    public entityDto?: ClimateEntityDto,
  ) {
    if (entityDto) {
      this.mode = entityDto.mode;
      this.setpoint = entityDto.setpoint;
      this.fan = entityDto.fan;
      this.swing = entityDto.swing;
      this.commands = entityDto.commands;
    }
  }

  static fromClimateEntityDto(climateEntityDto: ClimateEntityDto): Climate {
    return new Climate(climateEntityDto.name, climateEntityDto);
  }
}

type CreateClimateServiceDto = {
  databaseService: DatabaseService;
  deviceService: DeviceService;
};

export class ClimateService extends BaseService {
  private databaseService: DatabaseService;
  private deviceService: DeviceService;

  private climates: Map<string, Climate> = new Map();

  constructor(config: CreateClimateServiceDto) {
    super("ClimateService");
    this.databaseService = config.databaseService;
    this.deviceService = config.deviceService;
  }

  async initialize(): Promise<void> {
    try {
      console.log("Inicializando ClimateService...");
      await this.loadClimates();
      await this.loadEndpointsEvents();
      console.log(
        `ClimateService inicializado com sucesso! ${this.climates.size} climas encontrados.`
      );
    } catch (error) { }
  }

  private async loadClimates(): Promise<void> {
    const climates = await this.databaseService.find<ClimateEntityDto>(
      "climates"
    );
    climates.forEach((climateEntityDto) => {
      const climate = Climate.fromClimateEntityDto(climateEntityDto);
      this.climates.set(climate.name, climate);
    });
  }

  private async loadEndpointsEvents(): Promise<void> {
    this.deviceService.on("climate", (event) => {
      console.log("Climate event received:", event);
    });
  }

  destroy(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
