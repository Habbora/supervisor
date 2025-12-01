"use client";

import UserSideBar from '@/features/authentication/components/UserSideBar';
import Link from 'next/link';

function SidebarLogo() {
    return (
        <a className="flex justify-center g-2 p-2" href="/#">
            <img
                src="/logo/home-logic-marca.png"
                alt="Logo"
                className="p-4 rounded-lg bg-black"
            />
        </a>
    )
}

function NavSubItems({ index: i, name, href, mainHref, items }:
    {
        index: string,
        name: string,
        mainHref: string,
        href: string,
        items: SidebarNav[]
    }) {
    return (
        <Link href={mainHref + href} className="block hover:bg-white p-2 rounded text-sm text-gray-500 pl-6">
            <span>• {name}</span>
        </Link>
    )
}

function NavItems({ index: i, name, href, items }:
    {
        index: string,
        name: string, href: string,
        items: SidebarNav[]
    }) {
    return (
        <>
            <Link href={href} className="block hover:bg-white p-2">
                <span>{name}</span>
            </Link>
            {items.map((item, index) => (
                <NavSubItems
                    key={`${i}-${index}`}
                    index={`${i}-${index}`}
                    mainHref={href}
                    name={item.name} href={item.href}
                    items={item.items || []}
                />
            ))}
        </>
    )
}

function NavMenu({ name, items }: { name: string, items: SidebarNav[] }) {
    return (
        <nav className="overflow-auto h-full modern-scrollbar border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-500 p-2">{name}</span>
            </div>
            {items.map((item, index) => (
                <NavItems key={`${index}`} index={`${index}`} name={item.name} href={item.href} items={item.items || []} />
            ))}
        </nav>
    )
}

interface SidebarNav {
    name: string;
    href: string;
    icon?: React.ElementType;
    items?: SidebarNav[];
}

export default function Sidebar() {

    const mock: SidebarNav[] = [
        {
            name: '🏠 Início',
            href: '/',
            items: []
        },
        {
            name: '💡 Iluminação',
            href: '/lights',
            items: []
        },
        {
            name: '⏰ Agendamentos',
            href: '/schedules',
            items: [
            ]
        },
        {
            name: '⚙️ Configurações',
            href: '/settings',
            items: [
                {
                    name: 'Controladores',
                    href: '/controllers',
                },
                {
                    name: 'Iluminação',
                    href: '/lights',
                },
                {
                    name: 'Dispositivos',
                    href: '/devices',
                },
                {
                    name: 'Usuários',
                    href: '/users',
                },
                {
                    name: 'Ambientes',
                    href: '/environments',
                }
            ]
        }
    ]

    return (
        <aside className="flex flex-col h-full w-full rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-xl ">
            <SidebarLogo />
            <NavMenu name="Navegação" items={mock} />
            <UserSideBar />
        </aside>
    )
}
