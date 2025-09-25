// Tipo para definir os inputs do device
export interface DeviceInput {
    name: string;
    description: string;
    type: "string" | "number" | "boolean";
    value: string | number | boolean;
}

export type DeviceType = {
    id: string;
    name: string;
    type: string;
    isAlert: boolean;
    endpoints: any[];
    value: number;
    actions?: any[];
    inputs?: DeviceInput[];
}

export type CreateDeviceDTO = {
    name: string;
    type: string;
    endpoints?: {
        name: string;
        controllerId: string;
        endpointName: string;
    }[];
    inputs?: DeviceInput[];
}