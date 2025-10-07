export interface HidrometroType {
  id: number;
  name: string;
  consumoTotal: number;
  consumoDiario: number;
  consumoMensal: number;
  vazaoAtual: number;
}

interface HidrometroProps {
  hidrometro: HidrometroType;
}

export default function Hidrometro({ hidrometro }: HidrometroProps) {
  return (
    <div className="p-4 rounded-lg bg-gray-100 w-[300px]">
      <div className="flex flex-col gap-3">
        <span className="font-medium text-lg">{hidrometro.name}</span>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-500">Vazão Atual</div>
            <div className="text-xl font-bold flex items-baseline gap-1">
              {hidrometro.vazaoAtual}
              <span className="text-sm font-normal text-gray-500">L/min</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-500">Consumo</div>
            <div className="text-xl font-bold flex items-baseline gap-1">
              {hidrometro.consumoTotal}
              <span className="text-sm font-normal text-gray-500">m³</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-500">C. Diário</div>
            <div className="text-xl font-bold flex items-baseline gap-1">
              {hidrometro.consumoDiario}
              <span className="text-sm font-normal text-gray-500">m³</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg">
            <div className="text-sm text-gray-500">C. Mensal</div>
            <div className="text-xl font-bold flex items-baseline gap-1">
              {hidrometro.consumoMensal}
              <span className="text-sm font-normal text-gray-500">m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 