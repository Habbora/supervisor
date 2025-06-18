'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface WebSocketContextType {
    isConnected: boolean;
    message: WebSocketMessage | null;
}

export interface WebSocketMessage {
    type: string;
    code: number;
    payload: {
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
            isAlert: boolean;
        }[];
    }[]
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider do WebSocket
export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<WebSocketMessage | null>(null);

    function handleMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        setMessage(data);
    }

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:4001');
        ws.onopen = () => {
            setIsConnected(true);
            console.log('✅ Conectado ao WebSocket');
        };
        ws.onclose = () => {
            setIsConnected(false);
            console.log('❌ Desconectado do WebSocket');
            setSocket(null);
        };
        ws.onerror = (_) => {
            console.error('Erro ao conectar ao WebSocket');
            setSocket(null);
        };
        ws.onmessage = (event) => {
            handleMessage(event);
        };
        setSocket(ws);
    }

    useEffect(() => {
        connectWebSocket();
        return () => {
            socket?.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, message }}>
            {children}
        </WebSocketContext.Provider>
    );
}

// Hook personalizado para usar o contexto
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket deve ser usado dentro de um WebSocketProvider');
    }
    return context;
}