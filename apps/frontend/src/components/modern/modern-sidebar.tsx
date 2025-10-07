"use client";

import '../../styles/scrollbar.css'
import UserSideBar from '@/features/authentication/components/UserSideBar';

export interface ModernSidebarProps {
    navMain: any[];
}

function NavButton({ name, href }: { name: string, href: string }) {
    return (
        <a href={href} className="block hover:bg-white p-2">
            <span>{name}</span>
        </a>
    )
}

export default function ModernSidebar({ navMain }: ModernSidebarProps) {
    return (
        <aside className="flex flex-col h-full w-60 rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-xl ">
            {/* <h2 className="text-lg font-bold h-10">Supervisor</h2> */}
            <a className="flex justify-center g-2 p-2" href="/#"><img src="/logo/home-logic-marca.png" alt="Logo" className="p-4 rounded-lg bg-black" /></a>
            <nav className="overflow-auto h-full modern-scrollbar border-t border-gray-200 pt-4">
                {navMain.map((item) => (
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
