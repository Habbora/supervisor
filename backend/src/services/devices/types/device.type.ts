import type { Controller } from "../../controller/Controller";
import type { DeviceControllerDto } from "./dto.type";
import type { EventEmitter } from "events";

export interface IDevice extends EventEmitter {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    value?: number;
    controller?: Controller;
    endpoint?: string;
    onControllerEvent(data: DeviceEventData): this;
    addController(config: DeviceControllerDto): this;
    removeController(): this;
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