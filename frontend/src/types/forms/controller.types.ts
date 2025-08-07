export interface ControllerType {
    id: string;
    name: string;
    driverName: string;
    isConnected: boolean;
    isAlert: boolean;
    network: {
        type: string;
        host: string;
        port: number;
    };
    worker: {
        isRunning: boolean;
    };
}

export interface ControllerPostDataTypes {
    id: string;
    name: string;
    driverName: string;
    network: {
        type: string;
        host: string;
        port: number;
    };
}

export interface ControllerFormDataTypes {
    id?: string;
    name: string;
    driverName: string;
    host: string;
    port: number;
}