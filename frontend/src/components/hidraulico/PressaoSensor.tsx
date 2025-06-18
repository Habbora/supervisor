export interface PressaoType {
  id: number;
  name: string;
  pressao: number;
  unidade: "PSI" | "BAR";
  limiteMinimo: number;
  limiteMaximo: number;
}

interface PressaoSensorProps {
  sensor: PressaoType;
  onToggle?: () => void;
}

export default function PressaoSensor({ sensor, onToggle }: PressaoSensorProps) {
  const getStatusColor = (pressao: number) => {
    if (pressao <= sensor.limiteMinimo) return "bg-red-500";
    if (pressao >= sensor.limiteMaximo) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div 
      className="p-4 rounded-lg bg-gray-100 w-[200px] cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={onToggle}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-medium">{sensor.name}</span>
        <div className="text-3xl font-bold flex items-center gap-1">
          {sensor.pressao}
          <span className="text-sm text-gray-500">{sensor.unidade}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.pressao)}`} />
        <div className="text-sm text-gray-500">
          Min: {sensor.limiteMinimo} | Max: {sensor.limiteMaximo}
        </div>
      </div>
    </div>
  );
} 