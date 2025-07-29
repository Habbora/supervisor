import { useContext, useState, useCallback, useEffect } from "react";
import { WebSocketContext } from "./WebSocketContext";

interface WaterData {
    levels: any[];
  timestamp: number;
}

interface UseWaterReturn {
  waterData: WaterData | null;
  sendWaterCommand: (command: string, value?: any) => void;
  getWaterStatus: () => void;
}

export const useWater = (): UseWaterReturn => {
  const ws = useContext(WebSocketContext);
  const [waterData, setWaterData] = useState<WaterData | null>(null);

  // Função para enviar comandos relacionados à água
  const sendWaterCommand = useCallback((command: string, value?: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'water',
        command,
        value,
        timestamp: Date.now()
      };
      
      ws.send(JSON.stringify(message));
      console.log('Comando enviado:', message);
    } else {
      console.warn('WebSocket não está conectado');
    }
  }, [ws]);

  // Função para solicitar status da água
  const getWaterStatus = useCallback(() => {
    sendWaterCommand('getStatus');
  }, [sendWaterCommand]);

  // Processar mensagens recebidas
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Lógica para pegar apenas o primeiro item que é o tipo water
        const dataMessage = JSON.parse(event.data);
        const data = dataMessage.find((item: any) => item.type === 'water');
        
        // Verificar se é uma mensagem relacionada à água
        if (data) {
            setWaterData({
                levels: data.levels,
                timestamp: Date.now()
            });
            console.log("useWater: ", data);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    console.log("Criando um novo evento de mensagem!");
    
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  return {
    waterData,
    sendWaterCommand,
    getWaterStatus
  };
};
