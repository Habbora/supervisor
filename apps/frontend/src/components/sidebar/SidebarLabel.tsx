import { LucideIcon } from 'lucide-react';

interface SidebarLabelProps {
    name: string;
    icon: LucideIcon;
    isCollapsed: boolean;
    showBorder?: boolean;
}

export function SidebarLabel({ name, icon: Icon, isCollapsed, showBorder }: SidebarLabelProps) {
    return (
        <div
            className={`flex items-center px-4 py-3 ${
                showBorder ? 'mt-6 pt-6 border-t border-gray-300' : ''
            } ${isCollapsed ? 'justify-center' : ''}`}
        >
            <Icon
                className="h-5 w-5 text-gray-500 transition-all duration-300"
                strokeWidth={2}
            />
            {!isCollapsed && (
                <span className="ml-3 text-xs font-bold uppercase text-gray-500 tracking-wider whitespace-nowrap">
                    {name}
                </span>
            )}
        </div>
    );
}
