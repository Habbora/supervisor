export interface DeviceSchema {
    id: string;
    name: string;
    type: string;
    endpoints: any;
    inputs: any;
    outputs: any;
}

export interface DeviceCreateSchema {
    name: string;
    type: string;
}

export interface DeviceUpdateSchema {
    id: string;
    name: string;
    type: string;
    endpoints: any;
    inputs: any;
    outputs: any;
}