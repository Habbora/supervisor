import { Device } from "./Device";

export class DeviceManager {
    private static __instance: DeviceManager;
    private __devices: Map<string, Device> = new Map();

    private constructor() { }

    public static getInstance() {
        if (!DeviceManager.__instance) DeviceManager.__instance = new DeviceManager();
        return DeviceManager.__instance;
    }

    public addDevice(device: Device): this {
        this.__devices.set(device.id, device);

        return this;
    }

    public removeDevice(device: Device): this {
        this.__devices.delete(device.id);

        return this;
    }

    public getDevice(id: string): Device | undefined {
        return this.__devices.get(id);
    }

    get devices(): Map<string, Device> {
        return this.__devices;
    }
}