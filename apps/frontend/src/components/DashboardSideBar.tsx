'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MdDashboard,
    MdSecurity,
    MdPower,
    MdLightbulb,
    MdWaterDrop,
    MdVolumeUp,
    MdAcUnit,
    MdElevator,
    MdDoorFront,
    MdCamera,
    MdSettings,
    MdAnalytics,
    MdLogout
} from 'react-icons/md';

export interface MenuItem {
    name: string;
    icon: React.ElementType;
    href: string;
}

export default function DashboardSideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();

    const menuItems: MenuItem[] = [
        { name: 'Dashboard', icon: MdDashboard, href: '/' },
        //{ name: 'Segurança', icon: MdSecurity, href: '/dashboard/seguranca' },
        { name: 'Energia', icon: MdPower, href: '/dashboard/energia' },
        { name: 'Iluminação', icon: MdLightbulb, href: '/dashboard/iluminacao' },
        { name: 'Hídrico', icon: MdWaterDrop, href: '/dashboard/water' },
        { name: 'Som', icon: MdVolumeUp, href: '/dashboard/sound' },
        { name: 'Climatização', icon: MdAcUnit, href: '/dashboard/climate' },
        { name: 'Elevadores', icon: MdElevator, href: '/dashboard/elevators' },
        //{ name: 'Acessos', icon: MdDoorFront, href: '/dashboard/acessos' },
        //{ name: 'Câmeras', icon: MdCamera, href: '/dashboard/cameras' },
        //{ name: 'Análises', icon: MdAnalytics, href: '/dashboard/analises' },
        { name: 'Configurações', icon: MdSettings, href: '/dashboard/settings' },
        { name: 'Sair', icon: MdLogout, href: '/logout' },
    ];

    return (
        <div className='m-4'>
            <aside
                className={`flex flex-col transition-all duration-300 ease-in-out shadow-lg rounded-lg${isCollapsed ? 'w-16' : 'w-80'}`}
            >
                {/* Botão retrátil */}
                <div className="flex items-center justify-end p-4 border-b border-gray-200">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Menu centralizado */}
                <nav className="flex-1 flex flex-col items-center space-y-6 overflow-y-auto scrollbar-hide">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-center w-full p-4 m-0 cursor-pointer hover:bg-gray-200 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                            onClick={() => router.push(item.href)}
                        >
                            <item.icon className="w-6 h-6" />
                            {!isCollapsed && (
                                <span className="ml-2 whitespace-nowrap">{item.name}</span>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
        </div>
    );
}
