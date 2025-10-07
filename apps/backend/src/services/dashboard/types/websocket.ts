export type WebSocketResponse<T> = {
    type: string;
    code: number;
    payload: any;
};

export type WebSocketDashboard = {
    id: number;
    name: string;
    lights: {
        id: number;
        name: string;
        type: "dimmer" | "switch" | "pulse";
        status: number;
    }[];
    levels: {
        id: string;
        name: string;
        value: number;
    }[];
};