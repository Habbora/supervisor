import { useState } from "react";
import { Power } from "lucide-react";
import { useDashboard } from "../../contexts/dashboardContext";
import { LightButton, LugarContainer, Title } from "./style";

interface LightDeviceProps {
  light: {
    id: number;
    name: string;
    isOn: boolean;
    timer?: number;
  };
  isDark: boolean;
}

export function LightDeviceComponent({ light, isDark }: LightDeviceProps) {
  const { setLightStatus } = useDashboard();
  const [timer, setTimer] = useState(light.timer || 0);

  const handleToggleLight = () => {
    if (light.isOn) {
      setLightStatus(light.id, false);
    } else {
      setLightStatus(light.id, true, timer);
    }
  };

  return (
    <LugarContainer isDark={isDark}>
      <Title isDark={isDark}>
        <span>{light.name}</span>
        <Power className="icon" size={20} />
      </Title>
      <div>
        <select
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
            background: isDark ? "#2d2d2d" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
            marginBottom: "1rem",
            width: "100%",
          }}
        >
          <option value={0}>Sem temporizador</option>
          <option value={300}>5 minutos</option>
          <option value={600}>10 minutos</option>
          <option value={900}>15 minutos</option>
          <option value={1800}>30 minutos</option>
          <option value={3600}>1 hora</option>
        </select>
        <LightButton
          type="button"
          active={light.isOn}
          isDark={isDark}
          onClick={handleToggleLight}
        >
          {light.isOn ? "Desligar" : "Ligar"}
        </LightButton>
      </div>
    </LugarContainer>
  );
} 