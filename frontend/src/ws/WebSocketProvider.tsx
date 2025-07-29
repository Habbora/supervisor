import { useEffect, useRef, useState } from "react";
import { WebSocketContext } from "./WebSocketContext";

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const getWsUrl = () => {
        return process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:4001`;
    }

    useEffect(() => {
        try {
            console.log("WebSocket Provider foi Iniciado!")

            ws.current = new WebSocket(getWsUrl());

            ws.current.onopen = () => {
                console.log("WebSocket conectado.")
                setIsConnected(true)
            };

            ws.current.onclose = () => {
                console.log("WebSocket desconectado.")
                setIsConnected(false)
            };

            ws.current.onerror = (error) => {
                console.log("WebSocket error.")
                setIsConnected(false)
            };

            ws.current.onmessage = (event) => {
                console.log("Mensagem recebida:", event.data);
            };
        } catch (error) {
            console.error("Erro ao conectar WebSocket:", error);
        }

        return () => ws.current?.close();
    }, [ws]);

    return <WebSocketContext.Provider value={ws.current}> {children} </WebSocketContext.Provider>;
};