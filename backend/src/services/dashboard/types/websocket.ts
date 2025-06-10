export type WebSocketResponse<T> = {
    type: string;
    code: number;
    payload: T[];
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
};