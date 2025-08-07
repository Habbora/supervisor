"use client";

import { useEffect, useState } from "react";

export interface LevelSensorType {
  id: string;
  type: string;
  name: string;
  value: number;
  isAlert?: boolean;
}

interface LevelSensorProps {
  device: LevelSensorType;
}

export default function LevelSensor({ device }: LevelSensorProps) {
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
      className={`w-[200px] h-[200px] p-4 rounded-lg bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors ${device.isAlert
          ? "bg-red-100 hover:bg-red-200"
          : "bg-green-100 hover:bg-green-200"

        }`}
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-medium text-center">{device.name}</h1>
        <div className="w-full h-32 rounded-lg relative">
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 rounded-lg"
            style={{ height: `${device.value > 100 ? 100 : device.value < 0 ? 0 : device.value}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {Math.round(device.value)}%
          </div>
        </div>
      </div>
    </div>
  );
} 