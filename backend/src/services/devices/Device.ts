import { type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { EventBus } from "../EventBus";

// Quero mudar Device para {id: string, name: string, type: string, props: any}

type EndpointType = "analog_input" | "digital_input" | "analog_output" | "digital_output";

type Endpoint = {
    name: string;
    type: EndpointType;
    controller: string;
    endpoint: string;
}

export interface DeviceDTO {
    name: string;
    type: string;
    endpoints?: Endpoint[];
}

export class Device {
    public readonly id: string;
    public readonly name: string;
    public readonly type: string;
    public value: number;
    public endpoints: Endpoint[];

    constructor(id: string, dto: DeviceDTO) {
        this.id = id;
        this.name = dto.name;
        this.type = dto.type;
        this.value = -1;
        this.endpoints = dto.endpoints ?? [];

        EventBus.getInstance().subscribe('endpoint_event', (data: any) => {
            this.onEndpointEvent(data);
        });
    }

    onEndpointEvent(data: any): this {
        this.endpoints?.forEach((endpoint) => {
            if (endpoint.controller === data.controller && endpoint.endpoint === data.endpoint) {
                this.value = data.value;

                EventBus.getInstance().publish('device_value_changed', {
                    id: this.id,
                    name: this.name,
                    value: this.value
                });

                EventBus.getInstance().publish('device_event', {
                    id: this.id,
                    name: this.name,
                    value: this.value
                });
            }
        });

        return this;
    }

    onControllerEvent(data: DeviceEventData): this {
        throw new Error('Method not implemented.');
    }

    createEndpoint(name: string, type: EndpointType, controller: string, endpoint: string): Endpoint | undefined {
        if (this.endpoints?.find((e) => e.name === name)) return;

        const newEndpoint: Endpoint = {
            name,
            type,
            controller,
            endpoint,
        };

        this.endpoints.push(newEndpoint);

        return newEndpoint;
    }

    readEndpoint(name: string): Endpoint | undefined {
        return this.endpoints?.find((e) => e.name === name);
    }

    updateEndpoint(name: string, type: EndpointType, controller: string, endpoint: string): Endpoint | undefined {
        const oldEndpoint = this.endpoints?.find((e) => e.name === name);
        if (!oldEndpoint) return;

        this.endpoints = this.endpoints.map((e) => e.name === name ? { ...e, type, controller, endpoint } : e);

        return oldEndpoint;
    }

    deleteEndpoint(name: string): Endpoint | undefined {
        const oldEndpoint = this.endpoints?.find((e) => e.name === name);
        if (!oldEndpoint) return;

        this.endpoints = this.endpoints.filter((e) => e.name !== name);

        return oldEndpoint;
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

    destroy(): void {
        EventBus.getInstance().unsubscribe('endpoint_event', (data: any) => {
            this.onEndpointEvent(data);
        });
    }
}
