import type { Controller } from "../../controller/Controller";
import type { DeviceControllerDto } from "./dto.type";
import type { EventEmitter } from "events";

export type DeviceType = "level" | "light" | "pump" | "valve" | "other";

export interface IDevice {
    readonly id: string;
    readonly name: string;
    readonly type: DeviceType;
    controllerId?: string;
    value?: number;
    endpoint?: string;
    onControllerEvent(data: DeviceEventData): this;
}

export type DeviceEventData = {
    value: number;
    timestamp: number;
    status: 'active' | 'inactive' | 'error';
};

export class DeviceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DeviceError';
    }
}