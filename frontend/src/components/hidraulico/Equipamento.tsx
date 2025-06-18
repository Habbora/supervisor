import { IconType } from "react-icons";

interface EquipamentoType {
  name: string;
  isOn: boolean;
  value?: string;
  unit?: string;
}

interface EquipamentoProps {
  equipamento: EquipamentoType;
  icon: IconType;
  onToggle: () => void;
}

export default function Equipamento({ equipamento, icon: Icon, onToggle }: EquipamentoProps) {
  return (
    <div className="w-48 h-auto bg-white rounded-lg shadow-md p-4 m-2 flex flex-col justify-between gap-4">
      <div className="flex items-center gap-2">
        <Icon
          className={`w-6 h-6 ${
            equipamento.isOn ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <span className="font-medium">{equipamento.name}</span>
      </div>
      
      {equipamento.value && (
        <div className="text-center">
          <span className="text-2xl font-bold">{equipamento.value}</span>
          {equipamento.unit && <span className="text-sm ml-1">{equipamento.unit}</span>}
        </div>
      )}

      <button
        onClick={() => onToggle()}
        className={`w-full py-2 rounded-md text-white transition-colors ${
          equipamento.isOn
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {equipamento.isOn ? "Desligar" : "Ligar"}
      </button>
    </div>
  );
} 