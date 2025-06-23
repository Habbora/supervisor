import { EventEmitter } from "events";
import type { IDevice } from "../types/device.type";

export class DeviceManager extends EventEmitter {
    private devices: Map<string, IDevice> = new Map();

    constructor() {
        super();
        this.devices = new Map();
    }

    public addDevice(device: IDevice): IDevice {
        this.devices.set(device.id, device);
        device.on("valueChanged", (data) => {
            this.emit("valueChanged", data);
        });

        return device;
    }

    public removeDevice(device: IDevice): void {
        this.devices.delete(device.id);
        device.off("valueChanged", (data) => {
            this.emit("valueChanged", data);
        });
    }

    public getDevice(id: string): IDevice | undefined {
        return this.devices.get(id);
    }

    public getDevices(): Map<string, IDevice> {
        return this.devices;
    }
}