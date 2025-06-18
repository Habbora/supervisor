'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GroupContext } from './types/light/LightGroup.type';

export interface DashboardContextType {
  lightGroups: GroupContext[];
  isConnected: boolean;
  sendMessage: (message: string) => void;
  setToggleLight: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider do WebSocket
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lightGroups, setLightGroups] = useState<DashboardContextType['lightGroups']>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000;

  const setToggleLight = (id: string) => {
    fetch(`${window.location.origin.replace('3000', '4001')}/api/v1/light?lightName=${id}&action=setToggle`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      });
  }

  const connectWebSocket = (url: string) => {
    const ws = new WebSocket(url);
    ws.onopen = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log('Conectado ao WebSocket');
    };
    ws.onclose = () => {
      setIsConnected(false);
      console.log('Desconectado do WebSocket');
      setSocket(null);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
        console.log(`Tentativa de reconexão ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS} em ${delay / 1000} segundos`);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket(url);
        }, delay);
      } else {
        console.error('Número máximo de tentativas de reconexão atingido');
      }
    };
    ws.onerror = (_) => {
      console.error('Erro ao conectar ao WebSocket');
      setSocket(null);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
        console.log(`Tentativa de reconexão ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS} em ${delay / 1000} segundos`);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket(url);
        }, delay);
      } else {
        console.error('Número máximo de tentativas de reconexão atingido');
      }
    };
    ws.onmessage = (event) => {
      console.log(event.data);
      const data: {
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
      } = JSON.parse(event.data);

      setLightGroups([data.payload[0]]);
    };
    setSocket(ws);
  }

  useEffect(() => {
    const url = window.location.origin.replace('3000', '4001');
    console.log(url);
    connectWebSocket(url);

    return () => {
      socket?.close();
    };
  }, []);

  // Função para enviar mensagens
  const sendMessage = (message: string) => {
    if (socket && isConnected) {
      console.log(message);
      socket.send(message);
    }
  };

  return (
    <DashboardContext.Provider value={{ lightGroups, isConnected, sendMessage, setToggleLight }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard deve ser usado dentro de um DashboardProvider');
  }
  return context;
}