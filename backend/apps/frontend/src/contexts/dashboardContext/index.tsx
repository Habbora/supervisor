"use client";

import { LightType } from "@home/types/frontend";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type ElevatorPump = {
  id: number;
  name: string;
  isOn: boolean;
  hasError: boolean;
  hoursOn: number;
};

type Reservoir = {
  id: number;
  name: string;
  readings: {
    value: number;
    timestamp: string;
  }[];
};

type ReservoirBuildingType = {
  id: number;
  name: string;
  reservoirs: Reservoir[];
  pumps: ElevatorPump[];
};

type TemperatureSensor = {
  id: number;
  name: string;
  readings: {
    chillerEntrada: number;
    chillerSaida: number;
    aquecedor: number;
  }[];
};

type DashboardState = {
  lights?: LightType[];
  activeScreen: "home" | "waters" | "lights" | "temperature" | "generators";
};

type DashboardContextType = {
  state: DashboardState;
  commands: {
    light: {
      getAll: () => LightType[] | undefined;
      getById: (id: string) => LightType | undefined;
      setOn: (id: string) => void;
      setOff: (id: string) => void;
      setToggle: (id: string) => void;
    };
  };
  socket: WebSocket | null;
  setActiveScreen: (
    screen: "home" | "waters" | "lights" | "temperature" | "generators"
  ) => void;
  updateDashboardState: (newState: DashboardState) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

type WebSocketRequest = {
  type:
    | "LIGHT_UPDATE"
    | "TEMPERATURE_UPDATE"
    | "RESERVOIR_UPDATE"
    | "PUMP_STATUS_UPDATE"
    | "PUMP_ERROR_UPDATE";
  payload: any;
};

type WebSocketResponseType = "UPDATE_STATE";
type WebSocketResponsePayload = Omit<DashboardState, "activeScreen">;
type WebSocketResponse = {
  type: WebSocketResponseType;
  payload: WebSocketResponsePayload;
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>({ activeScreen: "home" });
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (socket) return;
    let ws: WebSocket;
    let reconnectInterval: NodeJS.Timeout | undefined;

    const connect = () => {
      ws = new WebSocket("ws://localhost:3001/ws");
      setSocket(ws);

      ws.onopen = () => {
        console.log("WebSocket conectado");
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = undefined;
        }
      };

      ws.onclose = () => {
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketResponse;

          console.log(data);

          switch (data.type) {
            case "UPDATE_STATE":
              setState({
                ...data.payload,
                activeScreen: state?.activeScreen,
              });
              break;
          }
        } catch (error) {
          console.error("Erro ao converter dados:", error);
        }
      };
    };

    connect();

    return () => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
      ws.close();
    };
  }, []);

  const setActiveScreen = (
    screen: "home" | "waters" | "lights" | "temperature" | "generators"
  ) => {
    setState((prevState) => ({
      ...prevState,
      activeScreen: screen,
    }));
  };

  const sendWebSocketMessage = (type: string, payload: DashboardState) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload: payload }));
    }
  };

  const updateDashboardState = (newState: DashboardState) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendWebSocketMessage("UPDATE_STATE", newState);
    }
  };

  const commands = {
    light: {
      getAll: () => state.lights,
      getById: (id: string) => state.lights?.find((light) => light.id === id),
      setOn: (id: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "LIGHT_EVENT", payload: { id, event: "ON" } }));
        }
      },
      setOff: (id: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "LIGHT_EVENT", payload: { id, event: "OFF" } }));
        }
      },
      setToggle: (id: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log(socket);
          socket.send(JSON.stringify({ type: "LIGHT_EVENT", payload: { id, event: "TOGGLE" } }));
        }
      },
    },
  };

  return (
    <DashboardContext.Provider
      value={{
        state,
        commands,
        socket,
        setActiveScreen,
        updateDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
