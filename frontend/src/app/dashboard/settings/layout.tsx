'use client'

import DashboardTopMenu from "@/components/DashboardTopMenu";
import { MdSettings } from "react-icons/md";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <div className="p-4 space-y-4">
        <DashboardTopMenu
            title="Configurações"
            icon={MdSettings}
            menuItems={[
                {
                    name: "Dispositivos",
                    icon: MdSettings,
                    href: "/dashboard/settings/devices",
                },
                {
                    name: "Controladores",
                    icon: MdSettings,
                    href: "/dashboard/settings/controllers",
                },

            ]}
        />
        {children}
    </div>;
}