import { Controller } from "@/services/controllers/controller/controller";
import { DatabaseController } from "@services/database/controllers";
import type { ControllerSchema } from "@services/database/controllers/schema";
import { readControllerConfigs } from "@services/controllers/utils/readDeviceConfig";
import type { CreateControllerDTO } from "../controller/controller.dto";

export class ControllerManager {
  private static instance: ControllerManager;

  // Map de controllers (id, controller);
  private controllers: Map<string, Controller> = new Map();

  private constructor() {
    this.loadControllers();
  }

  // Singleton
  public static getInstance(): ControllerManager {
    if (!ControllerManager.instance) ControllerManager.instance = new ControllerManager();
    return ControllerManager.instance;
  }

  private loadControllers() {
    const controllers = DatabaseController.getInstance().findAll();
    controllers.forEach((controllerDatabase: ControllerSchema) => {
      const controller = new Controller(controllerDatabase);
      this.controllers.set(controller.id, controller);
    });
  }

  public findAll(): Controller[] {
    return Array.from(this.controllers.values());
  }

  public findById(id: string): Controller | undefined {
    const controller = this.controllers.get(id);
    return controller;
  }

  public create(controller: CreateControllerDTO): Controller | undefined {
    // Etapa 1: Verifica se o driverName existe;
    const driverNameList = readControllerConfigs().map(config => config.name);
    if (!driverNameList.includes(controller.type)) {
      throw new Error("Driver name not found");
    }

    // Etapa 2: Adiciona o controller ao banco de dados;
    const databaseController = DatabaseController.getInstance();
    const newControllerDatabase: ControllerSchema | undefined = databaseController.addController(controller);

    // Etapa 3: Verifica se o controller foi adicionado ao banco de dados;
    if (!newControllerDatabase) throw new Error("Failed to create controller");

    // Etapa 4: Cria o controller;
    const newController = new Controller(newControllerDatabase);

    // Etapa 5: Adiciona o controller ao mapa;
    this.controllers.set(newController.id, newController);

    // TODO: Retornar apenas informações necessárias para o frontend;
    return newController;
  }

  public remove(id: string): Controller | undefined {
    const controller = this.controllers.get(id);
    if (!controller) return undefined;

    controller.stop();

    DatabaseController.getInstance().removeControllerById(id);
    this.controllers.delete(id);
    return controller;
  }

  public update(id: string, controller: CreateControllerDTO): Controller | undefined {
    const oldController = this.findById(id);
    if (!oldController) return undefined;

    oldController.stop();

    const newControllerDatabase = DatabaseController.getInstance().updateController(id, controller);
    console.log(newControllerDatabase);
    if (!newControllerDatabase) return undefined;

    const newController = new Controller(newControllerDatabase);
    this.controllers.set(newController.id, newController);

    if (!newController) return undefined;

    return newController;
  }

  public getControllerConfig(type: string): any | undefined {
    const config = readControllerConfigs().find(config => config.name === type);
    return config;
  }
}
