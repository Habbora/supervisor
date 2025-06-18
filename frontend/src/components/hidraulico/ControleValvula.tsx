export interface ValvulaType {
  id: number;
  name: string;
  isOpen: boolean;
  tipo: "manual" | "solenoide" | "motorizada";
}

interface ControleValvulaProps {
  valvula: ValvulaType;
  onToggle: () => void;
}

export default function ControleValvula({ valvula, onToggle }: ControleValvulaProps) {
  const getTipoIcon = (tipo: ValvulaType["tipo"]) => {
    switch (tipo) {
      case "manual":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7h.01M14 17h.01M10 7h.01M10 17h.01M7 11h.01M7 14h.01M17 11h.01M17 14h.01" />
          </svg>
        );
      case "solenoide":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "motorizada":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 w-[200px] ${
        valvula.isOpen
          ? "bg-green-100 hover:bg-green-200"
          : "bg-red-100 hover:bg-red-200"
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{valvula.name}</span>
          {getTipoIcon(valvula.tipo)}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              valvula.isOpen ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {valvula.isOpen ? "Aberta" : "Fechada"}
          </span>
        </div>
        <div className="text-xs text-gray-500 capitalize">
          Tipo: {valvula.tipo}
        </div>
      </div>
    </div>
  );
} 