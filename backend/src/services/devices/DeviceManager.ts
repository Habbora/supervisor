import { EventEmitter } from "events";
import type { IDevice } from "./types/device.type";
import { EventBus } from "../EventBus";

export class DeviceManager extends EventEmitter {
    private static instance: DeviceManager;

    private devices: Map<string, IDevice> = new Map();

    constructor() {
        super();
        this.devices = new Map();
    }

    public static getInstance(): DeviceManager {
        if (!DeviceManager.instance) {
            DeviceManager.instance = new DeviceManager();
        }
        return DeviceManager.instance;
    }

    public addDevice(device: IDevice): IDevice {
        this.devices.set(device.id, device);
        EventBus.getInstance().publish("device_added", device.name);

        return device;
    }

    public removeDevice(device: IDevice): void {
        this.devices.delete(device.id);
    }

    public getDevice(id: string): IDevice | undefined {
        return this.devices.get(id);
    }

    public getDevices(): Map<string, IDevice> {
        return this.devices;
    }
}