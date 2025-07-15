import EventEmitter from "events";
import type { DeviceDto } from "./types/dto.type";
import { DeviceError, type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";

export class Device implements IDevice {
    protected readonly _id: string;
    protected readonly _name: string;
    protected _value: number;
    protected _controller?: string;
    protected _endpoint?: Map<number, string>;

    constructor(dto: {
        name: string;
        type: string;
    }) {
        this._id = crypto.randomUUID();
        this._name = dto.name;
        this._value = 0;
    }

    onControllerEvent(data: DeviceEventData): this {
        throw new Error('Method not implemented.');
    }

    addController(controller: string): this {
        this._controller = controller;
        return this;
    }

    removeController(): this {
        this._controller = undefined;
        return this;
    }

    addEndpoint(endpoint: string, index: number): this {
        throw new Error('Method not implemented.');
    }

    removeEndpoint(endpoint: string, index: number): this {
        throw new Error('Method not implemented.');
    }

    removeAllEndpoints(): this {
        throw new Error('Method not implemented.');
    }

    _updateValue(value: number): this {
        throw new Error('Method not implemented.');
    }

    forceValue(value: number): this {
        throw new Error('Method not implemented.');
    }

    get controllerId(): string | undefined {
        return this._controller;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get type(): DeviceType {
        return 'level';
    }

    get value(): number {
        return this._value;
    }

    get endpoints(): Map<number, string> {
        return this._endpoint ?? new Map();
    }
}
