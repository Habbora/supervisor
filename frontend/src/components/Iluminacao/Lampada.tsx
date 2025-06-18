import { MdLightbulb } from "react-icons/md";
import { LampadaType } from "./IluminacaoGrupo";
interface LampadaProps {
  lampada: LampadaType;
  onToggle: () => void;
}

export default function Lampada({ lampada, onToggle }: LampadaProps) {

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 w-[200px] ${
        lampada.status > 0
          ? "bg-green-100 hover:bg-green-200"
          : "bg-red-100 hover:bg-red-200"
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{lampada.name}</span>
          <MdLightbulb />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              lampada.status > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {lampada.status > 0 ? "Ligada" : "Desligada"}
          </span>
        </div>
      </div>
    </div>
  );
}
