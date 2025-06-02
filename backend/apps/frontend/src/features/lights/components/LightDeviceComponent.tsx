"use client";

import { Power } from "lucide-react";
import { useDashboard } from "@/contexts/dashboardContext";
import { LightButton, Title } from "./style";
import type { LightType } from "@home/types/frontend";
import { useEffect } from "react";

export interface LightDeviceProps {
  light: LightType;
  isDark: boolean;
}

export interface StyledProps {
  isDark: boolean;
}

export interface LightButtonProps extends StyledProps {
  active: boolean;
}

export function LightDeviceComponent({ light, isDark }: LightDeviceProps) {
  const { commands } = useDashboard();

  useEffect(() => {
    console.log("LightDeviceComponent: light", light);
  }, [light]);

  return (
    <>
      <Title isDark={isDark}>
        <span>{light.name}</span>
        <Power
          className="icon"
          size={20}
          color={light.isOn ? "green" : "gray"}
          aria-label={light.isOn ? "Luz ligada" : "Luz desligada"}
        />
      </Title>
      <div>
        <LightButton
          type="button"
          active={light.isOn}
          isDark={isDark}
          onClick={() => commands.light.setToggle(light.id)}
          aria-pressed={light.isOn}
        >
          {light.isOn ? "Desligar" : "Ligar"}
        </LightButton>
      </div>
    </>
  );
}
