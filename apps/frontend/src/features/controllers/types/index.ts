export type ControllerType = {
    id: string;
    name: string;
    type: string;
    configs: {
        network: {
            host: string;
            port: number;
        };
    };
    status: {
        isRunning: boolean;
        isConnected: boolean;
    };
    endpoints: {
        name: string;
        address: number;
        type: string;
    }[];
}

export type ControllerCreateDTO = {
    name: string;
    type: string;
}

export type ControllerUpdateDTO = {
    id: string;
    name: string;
    type: string;
    network: {
        host: string;
        port: number;
    }
}

export type CreateControllerDTO = {
    name: string;
    type: string;
    configs?: {
        network?: {
            host: string;
            port: number;
        }
    }
}