import {
    Home,
    Sparkles,
    Calendar,
    Settings,
    Users,
    Network,
    Package,
    Lightbulb,
    LucideIcon
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface MenuItem {
    name: string;
    icon: LucideIcon;
    href?: string;
    isSubmenu?: boolean;
    isLabel?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const SIDEBAR_WIDTH = {
    EXPANDED: 'w-64',
    COLLAPSED: 'w-20'
} as const;

export const SIDEBAR_TRANSITION = 'transition-all duration-300 ease-in-out' as const;

// ═══════════════════════════════════════════════════════════════════
// MENU CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const MENU_ITEMS: MenuItem[] = [
    // Main Navigation
    {
        name: 'Dashboard',
        icon: Home,
        href: '/'
    },
    {
        name: 'Iluminação',
        icon: Sparkles,
        href: '/lights'
    },
    {
        name: 'Agendamentos',
        icon: Calendar,
        href: '/schedules'
    },

    // Settings Section
    {
        name: 'Configurações',
        icon: Settings,
        isLabel: true
    },
    {
        name: 'Controladores',
        icon: Network,
        href: '/settings/controllers',
        isSubmenu: true
    },
    {
        name: 'Drivers',
        icon: Package,
        href: '/settings/drivers',
        isSubmenu: true
    },
    {
        name: 'Iluminação',
        icon: Lightbulb,
        href: '/settings/lights',
        isSubmenu: true
    },
    {
        name: 'Usuários',
        icon: Users,
        href: '/settings/users',
        isSubmenu: true
    }
];
