import { Controller } from "./Controller";
import { DatabaseController } from "../../database/controllers";
import type { ControllerSchema } from "../../database/controllers/schema";

export class ControllerManager {
  private __controllers: Map<string, Controller> = new Map();

  constructor() {
    const controllers = DatabaseController.getInstance().findAll();

    controllers.forEach((item: ControllerSchema) => {
      // Faz que o controller seja iniciado automaticamente
      const controller = new Controller({
        name: item.name,
        driverName: item.driverName,
        startConfig: item.startConfig
      });

      // Adiciona o controller ao mapa
      this.__controllers.set(controller.name, controller);
    });
  }

  public findAll(): Controller[] {
    return Array.from(this.__controllers.values());
  }

  public findByName(name: string): Controller | undefined {
    return this.__controllers.get(name);
  }

  public findById(id: string): Controller | undefined {
    const controllers = this.findAll();
    return controllers.find(controller => controller.id === id);
  }

  create(controller: ControllerSchema): Controller | undefined {
    // Verifica se o controller já existe
    const databaseController = DatabaseController.getInstance();
    const success = databaseController.addController(controller);

    if (!success) return undefined;

    const newController = new Controller({
      name: controller.name,
      driverName: controller.driverName,
      startConfig: controller.startConfig
    });

    this.__controllers.set(newController.name, newController);

    return newController;
  }

  remove(name: string): Controller | undefined {
    const controller = this.__controllers.get(name);

    if (!controller) return undefined;

    controller.stop();

    DatabaseController.getInstance().removeControllerByName(name);
    this.__controllers.delete(name);
    return controller;
  }

  updateByName(name: string, controller: Partial<Controller>): Controller | undefined {
    const oldController = this.remove(name);

    if (!oldController) return undefined;

    const newController = this.create({
      name: controller.name ?? oldController.name,
      driverName: controller.driverName ?? oldController.driverName,
      startConfig: controller.startConfig ?? oldController.startConfig,
    });

    if (!newController) return undefined;

    return newController;
  }
}
