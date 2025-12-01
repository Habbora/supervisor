import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    name: string;
    icon: LucideIcon;
    href: string;
    isActive: boolean;
    isCollapsed: boolean;
    isSubmenu?: boolean;
    onClick: () => void;
}

export function SidebarItem({
    name,
    icon: Icon,
    isActive,
    isCollapsed,
    isSubmenu,
    onClick
}: SidebarItemProps) {
    return (
        <button
            className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-200 text-gray-700'
            } ${!isCollapsed && isSubmenu ? 'pl-8' : ''}`}
            onClick={onClick}
            title={isCollapsed ? name : undefined}
            aria-label={name}
            aria-current={isActive ? 'page' : undefined}
        >
            <Icon
                className={`h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
            />
            {!isCollapsed && (
                <span
                    className={`ml-3 font-medium whitespace-nowrap text-sm ${
                        isActive ? 'text-white' : 'text-gray-700'
                    }`}
                >
                    {name}
                </span>
            )}
        </button>
    );
}
