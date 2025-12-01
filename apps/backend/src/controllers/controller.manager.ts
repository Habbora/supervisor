import { ControllerInstance, type CreateControllerInstanceProps } from "./controller.instance";
import type { Driver } from "./drivers/driver.interface";

export type DriverDefinition = {
    name: string;
    description: string;
    factory: (config: any) => Driver<any>;
}

export class ControllerManager {
    private static _instance: ControllerManager;
    private _controllers: Map<string, ControllerInstance> = new Map();
    private _availableDrivers: Map<string, DriverDefinition> = new Map();

    private constructor() { }

    public static getInstance(): ControllerManager {
        if (!ControllerManager._instance) ControllerManager._instance = new ControllerManager();
        return ControllerManager._instance;
    }

    public getAvailableDrivers() {
        return Array.from(this._availableDrivers.entries()).map(([type, def]) => ({
            type,
            name: def.name,
            description: def.description
        }))
    }

    public registerDriver(type: string, definition: DriverDefinition): ControllerManager {
        this._availableDrivers.set(type, definition);
        return this;
    }

    public async create(controller: CreateControllerInstanceProps) {
        const driverDef = this._availableDrivers.get(controller.driver);
        if (!driverDef) throw new Error(`Driver type '${controller.driver}' not found`)
        const newController = new ControllerInstance(controller, driverDef.factory)
        this._controllers.set(newController.id, newController);
        return newController;
    }

    public findAll(): ControllerInstance[] {
        return Array.from(this._controllers.values())
    }

    public findById(id: string): ControllerInstance | undefined {
        const controller = this._controllers.get(id);
        return controller;
    }

    public async remove(id: string): Promise<void> {
        const controller = this._controllers.get(id);
        if (controller) {
            await controller.close();
            this._controllers.delete(id);
        }
    }

    public getControllerConfig(type: string): any | undefined {
        const driverDef = this._availableDrivers.get(type);
        return driverDef;
    }
}
