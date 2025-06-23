import { EventEmitter } from "events";
import type { IDevice } from "../types/device.type";
import { EventBus } from "../../EventBus";

export class DeviceManager extends EventEmitter {
    private devices: Map<string, IDevice> = new Map();

    constructor() {
        super();
        this.devices = new Map();
    }

    public addDevice(device: IDevice): IDevice {
        this.devices.set(device.id, device);
        EventBus.getInstance().publish("device_added", device);
        device.on("valueChanged", (data) => {
            this.emit("valueChanged", data);
            EventBus.getInstance().publish("device_value_changed", data);
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