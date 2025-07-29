import { useCallback, useContext } from "react";
import { WebSocketContext } from "./WebSocketContext";

interface UseWebSocketReturn {
    ws: WebSocket | null;
    sendMessage: (message: string) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
    const ws = useContext(WebSocketContext);

    const sendMessage = useCallback((message: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            console.log("sendMessage", message);
        }
    }, [ws]);

    return { ws, sendMessage };
}