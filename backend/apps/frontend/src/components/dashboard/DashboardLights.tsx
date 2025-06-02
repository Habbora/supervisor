"use client";

import { useDashboard } from "@/contexts/dashboardContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DashboardCard, DashboardGrid, TitlePage } from "@/app/style";
import { LightDeviceComponent } from "@/features/lights/components/LightDeviceComponent";
import type { LightType } from "@home/types/frontend";

export function DashboadLights() {
  const { state } = useDashboard();
  const { isDark } = useTheme();

  if (!state.lights) {
    return (
      <>
        <TitlePage isDark={isDark}>Iluminação</TitlePage>
        <p>Nenhum dispositivo de iluminação encontrado.</p>
      </>
    );
  }

  if (state.lights.length === 0) {
    return (
      <>
        <TitlePage isDark={isDark}>Iluminação</TitlePage>
        <p>Nenhum dispositivo de iluminação encontrado.</p>
      </>
    );
  }

  return (
    <>
      <TitlePage isDark={isDark}>Iluminação</TitlePage>
      <DashboardGrid>
        {state.lights.map((light: LightType) => (
          <DashboardCard key={light.id} isDark={isDark}>
            <LightDeviceComponent light={light} isDark={isDark} />
          </DashboardCard>
        ))}
      </DashboardGrid>
    </>
  );
}
