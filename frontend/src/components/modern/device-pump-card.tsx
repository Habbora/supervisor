'use client';

import { useWebSocket } from "@/ws/useWebSocket";

export interface PumpType {
  id: string;
  name: string;
  value: number;
  isAlert?: boolean;
  specs?: {
    power?: number;
    flow?: number;
  }
}

interface PumpControlProps {
  device: PumpType;
}

export default function PumpControl({ device: device }: PumpControlProps) {
  const { sendMessage } = useWebSocket();

  const handleToggle = () => {
    sendMessage(JSON.stringify({
      type: "pump",
      action: "toggle",
      id: device.id,
    }));
  };

  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${
        device.isAlert
          ? "bg-red-100 hover:bg-red-200"
          : device.value
            ? "bg-green-100 hover:bg-green-200"
            : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={handleToggle}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{device.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              device.isAlert ? "bg-red-500" : device.value ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {device.isAlert ? "Falha" : device.value ? "Ligada" : "Desligada"}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          {device.specs?.power && <div>Potência: {device.specs.power} HP</div>}
          {device.specs?.flow && <div>Vazão: {device.specs.flow} L/min</div>}
        </div>
      </div>
    </div>
  );
} 