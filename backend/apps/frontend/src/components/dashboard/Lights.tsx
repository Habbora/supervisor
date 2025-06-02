"use client";

import LightDeviceComponent from "@/components/DispositivoLuz";
import { DispositivosContainer } from "@/components/DispositivoLuz/style";
import { DashboardCard, DashboardGrid, TitlePage } from "@/app/style";
import { useDashboard } from "@/contexts/dashboardContext";

export default function LightsSection() {
  const { state, setLightStatus } = useDashboard();

  return (
    <div>
      <TitlePage>Iluminações</TitlePage>
      <DashboardGrid>
        {state.lights.map((light) => (
          <DashboardCard key={light.id}>
            <LightDeviceComponent
              light={light}
              ligarLuz={(id: number, tempo: number) => setLightStatus(id, true, tempo)}
              desligarLuz={(id: number) => setLightStatus(id, false)}
            />
          </DashboardCard>
        ))}
      </DashboardGrid>
    </div>
  );
} 