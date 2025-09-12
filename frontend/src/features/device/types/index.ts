export type DeviceType = {
    id: string;
    name: string;
    type: string;
    isAlert: boolean;
    endpoints: any[];
    value: number;
    actions?: any[];
}

export type CreateDeviceDTO = {
    name: string;
    type: string;
    endpoints?: {
        name: string;
        controllerId: string;
        endpointName: string;
    }[];
}