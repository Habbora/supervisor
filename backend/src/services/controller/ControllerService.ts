import { Controller } from "./Controller";
import { BaseService } from "../abstracts/BaseService";

export class ControllerManager extends BaseService {
  private __controllers: Map<string, Controller> = new Map();

  constructor() {
    super("ControllerManager");
  }

  async initialize(): Promise<this> {
    return this;
  }

  async destroy(): Promise<void> {
    this.__controllers.clear();
    await super.destroy();
  }

  getDevice(name: string): Controller | undefined {
    return this.__controllers.get(name);
  }

  getDeviceByName(name: string): Controller | undefined {
    return this.__controllers.get(name);
  }

  getAllDevices(): Controller[] {
    return Array.from(this.__controllers.values());
  }

  addDevice(controller: Controller) {
    this.__controllers.set(controller.name, controller);
  }

  removeDevice(controllerName: string) {
    this.__controllers.delete(controllerName);
  }

  updateDevice(controllerName: string, controller: Partial<Controller>) {
    this.__controllers.set(controllerName, { ...this.__controllers.get(controllerName), ...controller } as Controller);
  }
}
