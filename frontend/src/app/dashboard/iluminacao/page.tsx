'use client'

import DashboardTopMenu from "@/components/DashboardTopMenu";
import { MenuItem } from "@/components/DashboardSideBar";
import { MdLightbulb } from "react-icons/md";
import { IluminacaoGrupo, LampadaType } from "@/components/Iluminacao/IluminacaoGrupo";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import { DashboardContextType, useDashboard } from "@/contexts/DashboardContext";

export interface IluminacaoLayoutProps {
  children: React.ReactNode;
}

export default function Iluminacao({ children }: IluminacaoLayoutProps) {
  const { lightGroups, setToggleLight } = useDashboard();
  const [loading, setLoading] = useState(false);

  const handleToggle = (id: number) => {
    if (lightGroups && lightGroups[0] && lightGroups[0].lights) {
      setToggleLight(lightGroups[0].lights[id].name);
    }
  };

  const menuItems: MenuItem[] = [
    { name: "Grupos", icon: MdLightbulb, href: "/iluminacao/" },
    {
      name: "Agendamentos",
      icon: MdLightbulb,
      href: "/iluminacao/agendamentos",
    },
    {
      name: "Configurações",
      icon: MdLightbulb,
      href: "/iluminacao/configuracoes",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <DashboardTopMenu
        title="Iluminação"
        icon={MdLightbulb}
        menuItems={menuItems}
      />
      <div className="space-y-4">
        {lightGroups && lightGroups.map((group) => {
          return (
            <IluminacaoGrupo
              key={group.id}
              title={group.name}
              description={`Lâmpadas do ${group.name}`}
              lampadas={group.lights}
              handleToggle={handleToggle}
              handleLigar={() => {}}
              handleDesligar={() => {}}
            />
          );
        })}
      </div>

      {loading && <Loading />}
    </div>
  );
}
