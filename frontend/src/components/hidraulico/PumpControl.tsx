export interface PumpType {
  id: number;
  name: string;
  isOn: boolean;
  hasControl?: boolean;
  specs?: {
    power?: number;
    flow?: number;
  }
}

interface PumpControlProps {
  pump: PumpType;
  onToggle?: () => void;
}

export default function PumpControl({ pump, onToggle }: PumpControlProps) {
  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${
        pump.isOn
          ? "bg-green-100 hover:bg-green-200"
          : "bg-red-100 hover:bg-red-200"
      }`}
      onClick={pump.hasControl ? onToggle : () => {}}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{pump.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              pump.isOn ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {pump.isOn ? "Ligada" : "Desligada"}
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