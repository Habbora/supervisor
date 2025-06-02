"use client";

import { Lightbulb, LightbulbOff } from "lucide-react";
import { Controls, LightButton, LugarContainer, Title } from "./style";

type LightDeviceProps = {
  light: {
    id: number;
    name: string;
    status: boolean;
    tempoEscolhido: number;
  };
  ligarLuz: (id: number, tempo: number) => void;
  desligarLuz: (id: number) => void;
};

const LightDeviceComponent = ({ light, ligarLuz, desligarLuz }: LightDeviceProps) => {
  // Função chamada ao mudar o tempo escolhido
  const handleTempoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tempo = parseInt(e.target.value);
    ligarLuz(light.id, tempo);
  };

  return (
    <LugarContainer key={light.id}>
      <Title>
        {light.status ? (
          <Lightbulb className="icon" color="#d7c852" />
        ) : (
          <LightbulbOff className="icon" color="#ffffff" />
        )}
        <span>{light.name}</span>
      </Title>
      <Controls>
        <div>
          <select value={light.tempoEscolhido} onChange={handleTempoChange}>
            <option value={0} disabled>
              Selecione o tempo
            </option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={90}>1 hora 30 minutos</option>
            <option value={120}>2 horas</option>
            <option value={150}>2 horas 30 minutos</option>
            <option value={180}>3 horas</option>
            <option value={210}>3 horas 30 minutos</option>
            <option value={240}>4 horas</option>
            <option value={270}>4 horas 30 minutos</option>
            <option value={300}>5 horas</option>
            <option value={330}>5 horas 30 minutos</option>
            <option value={360}>6 horas</option>
            <option value={390}>6 horas 30 minutos</option>
            <option value={420}>7 horas</option>
            <option value={450}>7 horas 30 minutos</option>
            <option value={480}>8 horas</option>
          </select>
        </div>
        <div>
          <LightButton
            className="off"
            active={light.status}
            onClick={() => desligarLuz(light.id)}
          >
            Desligar
          </LightButton>

          <LightButton
            className="on"
            active={light.status}
            onClick={() => ligarLuz(light.id, light.tempoEscolhido)}
          >
            Ligar
          </LightButton>
        </div>
      </Controls>
    </LugarContainer>
  );
};

export default LightDeviceComponent;
