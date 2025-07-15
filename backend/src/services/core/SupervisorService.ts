import { DatabaseService } from "../database";
import { ControllerService } from "../controller";
import { BaseService } from "../abstracts/BaseService";
import { LightService } from "../light";
import { DashboardService } from "../dashboard";

export class SupervisorService extends BaseService {
  public dbService = new DatabaseService();
  public deviceService = new ControllerService(this.dbService);
  public lightService = new LightService({
    databaseService: this.dbService,
    deviceService: this.deviceService,
  });
  public dashboardService = new DashboardService(this.lightService);

  constructor() {
    super("Supervisor");
    (global as any).deviceService = this.deviceService;
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
