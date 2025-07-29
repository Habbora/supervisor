'use client';

import { useWebSocket } from "@/ws/useWebSocket";

export interface PumpType {
  id: string;
  name: string;
  value: boolean;
  isAlert?: boolean;
  specs?: {
    power?: number;
    flow?: number;
  }
}

interface PumpControlProps {
  pump: PumpType;
}

export default function PumpControl({ pump }: PumpControlProps) {
  const { sendMessage } = useWebSocket();

  const handleToggle = () => {
    sendMessage(JSON.stringify({
      type: "pump",
      action: "toggle",
      id: pump.id,
    }));
  };

  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${
        pump.isAlert
          ? "bg-red-100 hover:bg-red-200"
          : pump.value
            ? "bg-green-100 hover:bg-green-200"
            : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={handleToggle}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{pump.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              pump.isAlert ? "bg-red-500" : pump.value ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {pump.isAlert ? "Falha" : pump.value ? "Ligada" : "Desligada"}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          {pump.specs?.power && <div>Potência: {pump.specs.power} HP</div>}
          {pump.specs?.flow && <div>Vazão: {pump.specs.flow} L/min</div>}
        </div>
      </div>
    </div>
  );
} 