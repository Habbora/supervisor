'use client'

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import UserSideBar from '@/features/authentication/components/UserSideBar';
import {
    MENU_ITEMS,
    SIDEBAR_WIDTH,
    SIDEBAR_TRANSITION,
    SidebarLogo,
    SidebarToggle,
    SidebarLabel,
    SidebarItem
} from './sidebar';

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

function useActiveRoute() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (!href) return false;
        return href === '/' ? pathname === href : pathname.startsWith(href);
    };

    return { isActive };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DashboardSideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const { isActive } = useActiveRoute();

    const handleToggle = () => setIsCollapsed(prev => !prev);

    const handleNavigate = (href: string) => {
        router.push(href);
    };

    return (
        <aside
            className={`flex flex-col h-full bg-gray-100 border-r border-gray-200 shadow-xl ${SIDEBAR_TRANSITION} ${
                isCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED
            }`}
        >
            {/* Header with Logo and Toggle */}
            <div className="relative border-b border-gray-200">
                <SidebarLogo isCollapsed={isCollapsed} />
                <SidebarToggle isCollapsed={isCollapsed} onToggle={handleToggle} />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {MENU_ITEMS.map((item, index) => {
                    // Render Label (Section Header)
                    if (item.isLabel) {
                        return (
                            <SidebarLabel
                                key={item.name}
                                name={item.name}
                                icon={item.icon}
                                isCollapsed={isCollapsed}
                                showBorder={index > 0}
                            />
                        );
                    }

                    // Render Menu Item
                    return (
                        <SidebarItem
                            key={item.name + item.href}
                            name={item.name}
                            icon={item.icon}
                            href={item.href!}
                            isActive={isActive(item.href!)}
                            isCollapsed={isCollapsed}
                            isSubmenu={item.isSubmenu}
                            onClick={() => handleNavigate(item.href!)}
                        />
                    );
                })}
            </nav>

            {/* Footer with User Info */}
            <div className="border-t border-gray-200 mt-auto">
                <UserSideBar isCollapsed={isCollapsed} />
            </div>
        </aside>
    );
}
