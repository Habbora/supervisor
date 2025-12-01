"use client";

import { useEffect, useState } from "react";

export interface LevelSensorType {
  id: string;
  type: string;
  name: string;
  value?: number;
  isOnline?: boolean;
  isAlert?: boolean;
}

interface LevelSensorProps {
  device: LevelSensorType;
  className?: string;
}

export default function LevelSensor({ device, className }: LevelSensorProps) {
  // Usando useEffect para monitorar mudanças no isAlert
  const [alertaEmitido, setAlertaEmitido] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Verifica se tem alerta e se ainda não foi emitido
    if (device.isAlert && !alertaEmitido) {
      alert(`Alerta: Nível crítico no sensor ${device.name}`);
      setAlertaEmitido(true);
    }
    // Reseta o alerta quando isAlert voltar a false
    if (!device.isAlert) {
      setAlertaEmitido(false);
    }
  }, [device.isAlert, device.name, alertaEmitido]);

  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${className} ${device.value && device.value < 15
        ? "bg-red-100 hover:bg-red-300"
        : "bg-green-200 hover:bg-green-300"
        }`}
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-bold text-center">{device.name}</h1>
        <div className="w-full h-32 rounded-lg relative">
          <div className="h-full absolute bottom-0 left-0 right-0 rounded-lg bg-gray-500 opacity-50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 rounded-lg"
            style={{ height: `${device.value && device.value > 100 ? 100 : device.value && device.value >= 0 ? device.value ?? 0 : 0}%` }}
          />
          <div className="h-full absolute bottom-0 left-0 right-0 border-black border-2 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-black text-3xl font-bold">{Math.round(device.value ?? 0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
} 