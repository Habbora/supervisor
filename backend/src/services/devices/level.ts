import EventEmitter from "events";
import type { DeviceDto } from "./types/dto.type";
import { DeviceError, type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { EventBus } from "../EventBus";
import { Device } from "./Device";

export type LevelDto = DeviceDto & {
    value?: number;
    type: "level";
}

export class Level extends Device {

    constructor(dto: LevelDto) {
        if (dto.type !== 'level') {
            throw new DeviceError('Tipo de dispositivo inválido');
        }

        super(dto);
    }

    onControllerEvent(data: DeviceEventData): this {
        try {
            this._updateValue(data.value);
            EventBus.getInstance().publish('device_value_changed', {
                id: this.id,
                name: this.name,
                value: data.value
            });
        } catch (error) {
            EventBus.getInstance().publish('device_error', {
                id: this.id,
                name: this.name,
                error: error
            });
            throw error;
        }
        return this;
    }

    addEndpoint(endpoint: string, index: number): this {
        this._endpoint?.set(index, endpoint);
        EventBus.getInstance().publish('device_endpoint_added', {
            id: this.id,
            name: this.name,
            endpoint: endpoint
        });
        return this;
    }

    removeEndpoint(endpoint: string, index: number): this {
        this._endpoint?.delete(index);
        EventBus.getInstance().publish('device_endpoint_removed', {
            id: this.id,
            name: this.name,
            endpoint: endpoint
        });
        return this;
    }

    removeAllEndpoints(): this {
        this._endpoint = new Map();
        return this;
    }

    _updateValue(value: number): this {
        this._value = value;
        EventBus.getInstance().publish('device_value_changed', {
            id: this.id,
            name: this.name,
            value: value
        });
        return this;
    }

    forceValue(value: number): this {
        this._value = value;
        EventBus.getInstance().publish('device_value_changed', {
            id: this.id,
            name: this.name,
            value: value
        });
        return this;
    }
}
