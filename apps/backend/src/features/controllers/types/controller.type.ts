export type ControllerType = {
    id: string;
    name: string;
    type: string;
    configs?: ControllerConfigType;
    status?: ControllerStatusType;
};

export type ControllerConfigType = {
    network: ControllerConfigNetworkType;
}

export type ControllerConfigNetworkType = {
    type: string;
    host: string;
    port: number;
}

export type ControllerStatusType = {
    isRunning: boolean;
    isConnected: boolean;
}
