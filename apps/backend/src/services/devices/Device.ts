import { type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { EventBus } from "../event-bus/index.ts";
import type { Variable } from "@/types/api/device.types";

type Endpoint = {
    name: string;
    type: string;
    value?: any;
    controllerId?: string;
    endpointName?: string;
}

export interface DeviceDTO {
    name: string;
    type: string;
    endpoints?: Endpoint[];
    inputs?: Variable[];
    outputs?: Variable[];
}

export type DeviceCreateDTO = {
    name: string;
    type: string;
}

export type DeviceUpdateDTO = {
    name?: string;
    type?: string;
    endpoints?: Endpoint[];
    inputs?: Variable[];
    outputs?: Variable[];
}

export class Device {
    public readonly id: string;
    public readonly name: string;
    public readonly type: string;
    public value: number | boolean;
    public endpoints: Endpoint[];
    public actions: any;
    public inputs: Variable[] = [];
    public outputs: Variable[] = [];

    constructor(id: string, dto: DeviceDTO) {
        this.id = id;
        this.name = dto.name;
        this.type = dto.type;
        this.value = -1;
        this.endpoints = dto.endpoints ?? [];
        this.inputs = dto.inputs ?? [];
        this.outputs = dto.outputs ?? [];

        EventBus.getInstance().subscribe('endpoint_event', (data: any) => {
            this.onUpdateEndpoints(data);
        });

        this.forceReadEndpoints();
    }

    private onUpdateEndpoints(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }) {
        this.endpoints?.forEach(async (endpoint) => {
            if (endpoint.controllerId === data.controllerId && endpoint.endpointName === data.endpointName) {
                endpoint.value = data.value;

                await this.onEndpointEvent(data);

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
    }

    protected async onEndpointEvent(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }) { }

    public forceReadEndpoints() {
        this.endpoints.forEach((endpoint) => {
            EventBus.getInstance().publish('force_read_endpoint', {
                controllerId: endpoint.controllerId,
                endpointName: endpoint.endpointName,
            });
        });
    }

    public onControllerEvent(data: DeviceEventData): this {
        throw new Error('Method not implemented.');
    }

    public toDashboard() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            value: this.value,
            endpoints: this.endpoints
        }
    }

    public destroy(): void {
        EventBus.getInstance().unsubscribe('endpoint_event', (data: any) => {
            this.onEndpointEvent(data);
        });
    }
}
