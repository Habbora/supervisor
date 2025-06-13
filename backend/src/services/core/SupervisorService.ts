import { DatabaseService } from "../database";
import { DeviceService } from "../controller";
import { BaseService } from "../abstracts/BaseService";
import { LightService } from "../light";
import { DashboardService } from "../dashboard";
import { HydraulicService } from "../hydraulic";
import { DeviceManager } from "../devices/manager";

export class SupervisorService extends BaseService {
  public deviceManager: DeviceManager;

  public dbService = new DatabaseService();
  public deviceService = new DeviceService(this.dbService);
  public lightService = new LightService({
    databaseService: this.dbService,
    deviceService: this.deviceService,
  });
  public hydraulicService = new HydraulicService();
  public dashboardService = new DashboardService(this.lightService, this.hydraulicService);

  constructor() {
    super("Supervisor");
    this.deviceManager = new DeviceManager();
    (global as any).deviceManager = this.deviceManager;
  }

  async initialize(): Promise<this> {
    console.log("🚀 Iniciando Supervisor...");

    try {
      await this.dbService.initialize();
      await this.deviceService.initialize();
      await this.lightService.initialize();
      await this.dashboardService.initialize();

      (global as any).lightService = this.lightService;

      console.log("✅ Supervisor inicializado com sucesso!");
    } catch (error) {
      console.error("❌ Erro na inicialização:", error);
      process.exit(1);
    }

    return this;
  }

  async destroy(): Promise<void> {
    await this.dbService.destroy();
    await this.lightService.destroy();
    await this.deviceService.destroy();
    await this.dashboardService.destroy();
  }
}
