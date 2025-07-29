import { type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { EventBus } from "../EventBus";

// Quero mudar Device para {id: string, name: string, type: string, props: any}

type EndpointType = "analog_input" | "digital_input" | "analog_output" | "digital_output";

type Endpoint = {
    type: EndpointType;
    controller: string;
    endpoint: string;
    index: number;
}

export class Device {
    private readonly __id: string;
    private readonly __name: string;
    private readonly __type: string;

    protected __value: number;
    private __endpoint?: Map<number, Endpoint>;

    constructor(dto: {
        id?: string;
        name: string;
        type: string;
        endpoint?: Map<number, Endpoint>;
    }) {
        this.__id = dto.id ?? crypto.randomUUID();
        this.__name = dto.name;
        this.__type = dto.type;
        this.__value = 50;
        this.__endpoint = dto.endpoint ?? new Map();

        EventBus.getInstance().subscribe('endpoint_event', (data: any) => {
            this.onEndpointEvent(data);
        });
    }

    onEndpointEvent(data: any): this {
        this.__endpoint?.forEach((endpoint) => {
            if (endpoint.controller === data.controller && endpoint.endpoint === data.endpoint) {
                this.__value = data.value;

                EventBus.getInstance().publish('device_value_changed', {
                    id: this.id,
                    name: this.name,
                    value: this.__value
                });

                EventBus.getInstance().publish('device_event', {
                    id: this.id,
                    name: this.name,
                    value: this.__value
                });
            }
        });

        return this;
    }

    onControllerEvent(data: DeviceEventData): this {
        throw new Error('Method not implemented.');
    }

    setEndpoint(controller: string, endpoint: string, index: number, type: EndpointType): this {
        this.__endpoint?.set(index, {
            type,
            controller,
            endpoint,
            index
        });

        return this;
    }

    removeEndpoint(index: number): this {
        if (!this.__endpoint?.has(index)) throw new Error('Endpoint não existe');

        const endpoint = this.__endpoint?.get(index);
        this.__endpoint?.delete(index);

        return this;
    }

    removeAllEndpoints(): this {
        this.__endpoint?.clear();

        EventBus.getInstance().publish('device_endpoint_removed_all', {
            id: this.id,
            name: this.name,
        });

        return this;
    }

    toDashboard() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            value: this.value,
            endpoints: this.endpoints
        }
    }

    get id(): string {
        return this.__id;
    }

    get name(): string {
        return this.__name;
    }

    get type(): string {
        return this.__type;
    }

    get value(): number {
        return this.__value;
    }

    get endpoints(): Map<number, Endpoint> {
        return this.__endpoint ?? new Map();
    }
}
