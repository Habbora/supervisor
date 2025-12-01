"use client";

import '../../styles/scrollbar.css'
import UserSideBar from '@/features/authentication/components/UserSideBar';
import { useAuth } from '@/features/auth/hooks/useAuth';

function NavButton({ name, href }: { name: string, href: string }) {
    return (
        <a href={href} className="block hover:bg-white p-2">
            <span>{name}</span>
        </a>
    )
}

export default function ModernSidebar() {
    const { user } = useAuth();
    const isAdminOrSuper = user?.role === 'super' || user?.role === 'admin';

    const mock = [
        {
            id: 0,
            name: 'Navegação',
            href: '/',
            items: [
                {
                    id: 0,
                    name: '🏠 Início',
                    href: '/',
                    items: []
                },
                {
                    id: 1,
                    name: '💡 Iluminação',
                    href: '/lights',
                    items: []
                },
                {
                    id: 2,
                    name: '⏰ Agendamentos',
                    href: '/schedules',
                    items: []
                },
                // Configurações só aparece para super e admin
                ...(isAdminOrSuper ? [{
                    id: 4,
                    name: '⚙️ Configurações',
                    href: '/settings',
                    items: [
                        {
                            id: 0,
                            name: 'Geral',
                            href: '/',
                        },
                        {
                            id: 1,
                            name: 'Controladores',
                            href: '/controllers',
                        },
                        {
                            id: 2,
                            name: 'Dispositivos',
                            href: '/devices',
                        },
                        {
                            id: 3,
                            name: 'Usuários',
                            href: '/users',
                        },
                        {
                            id: 4,
                            name: 'Ambientes',
                            href: '/environments',
                        }
                    ]
                }] : [])
            ]
        },
    ]

    return (
        <aside className="flex flex-col h-full w-60 rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-xl ">
            {/* <h2 className="text-lg font-bold h-10">Supervisor</h2> */}
            <a className="flex justify-center g-2 p-2" href="/#"><img src="/logo/home-logic-marca.png" alt="Logo" className="p-4 rounded-lg bg-black" /></a>
            <nav className="overflow-auto h-full modern-scrollbar border-t border-gray-200 pt-4">
                {mock.map((item) => (
                    <div className="flex flex-col gap-2" key={`sidebar-${item.id}`}>
                        <span className="text-sm text-gray-500 p-2">{item.name}</span>
                        {item.items.map((subItem: any) => (
                            <div key={`sidebar-${item.id}-${subItem.id}`}>
                                <NavButton name={subItem.name} href={subItem.href} />
                                {subItem.items.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {subItem.items.map((subSubItem: any) => (
                                            <a href={subItem.href + subSubItem.href} className="block hover:bg-white p-2 rounded text-sm text-gray-500" key={`sidebar-${item.id}-${subItem.id}-${subSubItem.id}`}>
                                                <span className="pl-4">{subSubItem.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>
            <UserSideBar />
        </aside>
    )
}
