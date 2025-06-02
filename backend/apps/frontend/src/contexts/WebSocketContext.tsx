"use client"; // Adicione essa linha no topo!

import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001/ws");
    setSocket(ws);

    ws.onopen = () => console.log("WebSocket conectado!");
    ws.onclose = () => console.log("WebSocket desconectado!");

    return () => ws.close();
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
