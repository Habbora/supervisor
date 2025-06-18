'use client';

import { HidraulicoGrupo } from "@/components/hidraulico/HidraulicoGrupo";
import DashboardTopMenu from "@/components/DashboardTopMenu";
import { MdWater } from "react-icons/md";
import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { GroupContext } from "@/contexts/DashboardContext/types/light/LightGroup.type";
import { HydraulicLevelContext } from "@/contexts/DashboardContext/types/hydraulic/HydraulicType";

export default function HidraulicoPage() {
  const { lightGroups } = useDashboard();

  const toggleValvula = (id: number) => {
    console.log(id);
  }

  const toggleBomba = (id: number) => {
    console.log(id);
  }

  const ligarTudo = () => {
    console.log("ligarTudo");
  }

  const desligarTudo = () => {
    console.log("desligarTudo");
  }

  return (
      <div className="p-4 space-y-4">
        <DashboardTopMenu
          title="Hidráulico"
          icon={MdWater}
          menuItems={[]}
        />
        {/* Sistema Principal */}
        {lightGroups.map((grupo: GroupContext) => (
          <HidraulicoGrupo
            key={grupo.id}
            title={grupo.name}
            description={grupo.name}
            valvulas={[]}
            bombas={[]}
            niveis={grupo.levels.map((level: HydraulicLevelContext) => ({
              id: level.id,
              name: level.name,
              level: level.value,
              isAlert: level.isAlert,
            }))}
            pressoes={[]}
            hidrometros={[]}
            onToggleValvula={toggleValvula}
            onToggleBomba={toggleBomba}
            onLigarTudo={ligarTudo}
            onDesligarTudo={desligarTudo}
          />
        ))}
      </div>
  );
} 