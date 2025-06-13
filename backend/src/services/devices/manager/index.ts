import { EventEmitter } from "events";
import type { IDevice } from "../types/device.type";

export class DeviceManager extends EventEmitter {
    private devices: IDevice[] = [];

    constructor() {
        super();
        this.devices = [];
    }

    public addDevice(device: IDevice): void {
        this.devices.push(device);
        device.on("valueChanged", (data) => {
            this.emit("valueChanged", data);
        });
    }

    public removeDevice(device: IDevice): void {
        this.devices = this.devices.filter(d => d !== device);
        device.off("valueChanged", (data) => {
            this.emit("valueChanged", data);
        });
    }

    public getDevice(id: string): IDevice | undefined {
        return this.devices.find(d => d.id === id);
    }

    public getDevices(): IDevice[] {
        return this.devices;
    }
}