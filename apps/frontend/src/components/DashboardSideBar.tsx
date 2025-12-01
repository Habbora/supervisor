'use client'

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Sparkles,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    Users,
    Network,
    Package,
    Lightbulb,
    LucideIcon
} from 'lucide-react';
import UserSideBar from '@/features/authentication/components/UserSideBar';
import Link from 'next/link';

export interface MenuItem {
    name: string;
    icon: LucideIcon;
    href?: string;
    active?: boolean;
    isSubmenu?: boolean;
    isLabel?: boolean;
}

function SidebarLogo({ isCollapsed }: { isCollapsed: boolean }) {
    return (
        <Link href="/" className="flex items-center justify-center transition-all duration-300 py-3">
            <div className={`bg-black rounded-xl shadow-lg transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                <img
                    src="/logo/home-logic-marca.png"
                    alt="Logo"
                    className={`transition-all duration-300 object-contain ${isCollapsed ? 'w-10' : 'w-36'}`}
                    style={{ aspectRatio: '16/9' }}
                />
            </div>
        </Link>
    )
}

export default function DashboardSideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { name: 'Dashboard', icon: Home, href: '/' },
        { name: 'Iluminação', icon: Sparkles, href: '/lights' },
        { name: 'Agendamentos', icon: Calendar, href: '/schedules' },
        { name: 'Configurações', icon: Settings, isLabel: true },
        { name: 'Controladores', icon: Network, href: '/settings/controllers', isSubmenu: true },
        { name: 'Iluminação', icon: Lightbulb, href: '/settings/lights', isSubmenu: true },
        { name: 'Usuários', icon: Users, href: '/settings/users', isSubmenu: true },
    ];

    const isActive = (href: string) => {
        if (!href) return false;
        return href === '/' ? pathname === href : pathname.startsWith(href);
    }

    return (
        <aside
            className={`flex flex-col h-full bg-gray-100 border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            <div className="relative border-b border-gray-200">
                <SidebarLogo isCollapsed={isCollapsed} />

                {/* Botão de colapsar */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {menuItems.map((item, index) => {
                    if (item.isLabel) {
                        return (
                            <div
                                key={item.name}
                                className={`flex items-center px-4 py-3 ${index > 0 ? 'mt-6 pt-6 border-t border-gray-300' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className={`h-5 w-5 text-gray-500 transition-all duration-300`} strokeWidth={2} />
                                {!isCollapsed && (
                                    <span className="ml-3 text-xs font-bold uppercase text-gray-500 tracking-wider whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        );
                    }

                    const active = isActive(item.href!);

                    return (
                        <button
                            key={item.name + item.href}
                            className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${active
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                    : 'hover:bg-gray-200 text-gray-700'
                                } ${!isCollapsed && item.isSubmenu ? 'pl-8' : ''}`}
                            onClick={() => item.href && router.push(item.href)}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={`h-5 w-5 transition-all duration-300 ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                                    }`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            {!isCollapsed && (
                                <span className={`ml-3 font-medium whitespace-nowrap text-sm ${active ? 'text-white' : 'text-gray-700'
                                    }`}>
                                    {item.name}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 mt-auto">
                <UserSideBar isCollapsed={isCollapsed} />
            </div>
        </aside>
    );
}
