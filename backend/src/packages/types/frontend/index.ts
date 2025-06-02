export type LightType = {
  id: string;
  name: string;
  isOn: boolean;
};

// WebSocket Types que podem ser enviados para o backend
export type WebSocketEvent = {
  type: "UPDATE_STATE" | "LIGHT_EVENT";
  payload: any;
};

// WebSocket Types que podem ser recebidos do backend
export type LightEvent = {
  type: "LIGHT_EVENT";
  payload: {
    id: string;
    event: "ON" | "OFF" | "TOGGLE";
  };
};

export type SocketResponseType = "UPDATE_STATE";
export type SocketResponsePayload = Omit<DashboardState, "activeScreen">;

export type SocketResponse = {
  type: SocketResponseType;
  payload: SocketResponsePayload;
};
