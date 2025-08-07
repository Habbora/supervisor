"use client";

import '../../styles/scrollbar.css'
import { useAuth } from '../../hooks/useAuth'

interface menuItem {
    id: number;
    name: string;
    href: string;
    items: menuItem[];
}

export interface ModernSidebarProps {
    navMain: menuItem[];
}

function UserSection() {
    const { logout } = useAuth();

    const getUserName = () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const userData = JSON.parse(user);
                return userData.name || userData.username || 'Usuário';
            }
            return 'Usuário';
        } catch (error) {
            return 'Usuário';
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        < div className="mt-auto pt-4 border-t border-gray-200 bg-gray-100" >
            <div className="flex items-center justify-between p-2 mb-2">
                <span className="text-sm font-medium text-gray-700">👤 {getUserName()}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
            >
                <span>🚪</span>
                <span>Sair</span>
            </button>
        </div >
    )
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
                    <div className="flex flex-col gap-2" key={item.id}>
                        <span className="text-sm text-gray-500 p-2">{item.name}</span>
                        {item.items.map((subItem) => (
                            <div key={`${item.id}-${subItem.id}`}>
                                <NavButton name={subItem.name} href={subItem.href} />
                                {subItem.items.length > 0 && (
                                    <div className="flex flex-col gap-2" key={`${item.id}-${subItem.id}`}>
                                        {subItem.items.map((subSubItem) => (
                                            <a href={subItem.href + subSubItem.href} className="block hover:bg-white p-2 rounded text-sm text-gray-500" key={`${item.id}-${subItem.id}-${subSubItem.id}`}>
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
            <UserSection />
        </aside>
    )
}
