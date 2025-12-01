import Link from 'next/link';

interface SidebarLogoProps {
    isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
    return (
        <Link
            href="/"
            className="flex items-center justify-center transition-all duration-300 py-3"
        >
            <div
                className={`bg-black rounded-xl shadow-lg transition-all duration-300 ${
                    isCollapsed ? 'p-2' : 'p-4'
                }`}
            >
                <img
                    src="/logo/home-logic-marca.png"
                    alt="Home Logic Logo"
                    className={`transition-all duration-300 object-contain ${
                        isCollapsed ? 'w-10' : 'w-36'
                    }`}
                    style={{ aspectRatio: '16/9' }}
                />
            </div>
        </Link>
    );
}
