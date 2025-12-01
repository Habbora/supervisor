import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
            {isCollapsed ? (
                <ChevronRight size={20} />
            ) : (
                <ChevronLeft size={20} />
            )}
        </button>
    );
}
