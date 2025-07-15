import { useEffect, useState } from "react";

export interface LevelSensorType {
  id: string;
  name: string;
  level: number;
  isAlert: boolean;
}

interface LevelSensorProps {
  sensor: LevelSensorType;
}

export default function LevelSensor({ sensor }: LevelSensorProps) {
  // Usando useEffect para monitorar mudanças no isAlert
  const [alertaEmitido, setAlertaEmitido] = useState(false);

  useEffect(() => {
    // Verifica se tem alerta e se ainda não foi emitido
    if (sensor.isAlert && !alertaEmitido) {
      alert(`Alerta: Nível crítico no sensor ${sensor.name}`);
      setAlertaEmitido(true);
    }
    // Reseta o alerta quando isAlert voltar a false
    if (!sensor.isAlert) {
      setAlertaEmitido(false);
    }
  }, [sensor.isAlert, sensor.name, alertaEmitido]);

  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors ${sensor.isAlert
          ? "bg-red-100 hover:bg-red-200"
          : "bg-green-100 hover:bg-green-200"

        }`}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-medium">{sensor.name}</span>
        <div className="w-full h-32 rounded-lg relative">
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 rounded-lg"
            style={{ height: `${sensor.level > 100 ? 100 : sensor.level < 0 ? 0 : sensor.level}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {sensor.level}%
          </div>
        </div>
      </div>
    </div>
  );
} 