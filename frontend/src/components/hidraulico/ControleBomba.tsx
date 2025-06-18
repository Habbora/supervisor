export interface BombaType {
  id: number;
  name: string;
  isOn: boolean;
  potencia: number;
  vazao: number;
}

interface ControleBombaProps {
  bomba: BombaType;
  onToggle: () => void;
}

export default function ControleBomba({ bomba, onToggle }: ControleBombaProps) {
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 w-[200px] ${
        bomba.isOn
          ? "bg-green-100 hover:bg-green-200"
          : "bg-red-100 hover:bg-red-200"
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{bomba.name}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              bomba.isOn ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {bomba.isOn ? "Ligada" : "Desligada"}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex flex-col gap-1">
          <div>Potência: {bomba.potencia} HP</div>
          <div>Vazão: {bomba.vazao} L/min</div>
        </div>
      </div>
    </div>
  );
} 