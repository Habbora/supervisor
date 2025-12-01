import { useAuth } from "@/features/auth/hooks/useAuth";
import { Settings, LogOut } from "lucide-react";

interface UserSideBarProps {
    isCollapsed?: boolean;
    onLogout?: () => void;
}

export default function UserSideBar({ isCollapsed = false, onLogout }: UserSideBarProps) {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    // Gerar iniciais do nome
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (!user) return null;

    return (
        <div className="px-3 py-4 space-y-3">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {getInitials(user.name)}
                </div>

                {/* Info do usuário (visível quando não colapsado) */}
                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.role}
                        </p>
                    </div>
                )}

                {/* Ícone de configurações */}
                {!isCollapsed && (
                    <button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900">
                        <Settings className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Botão de Logout */}
            <button
                onClick={handleLogout}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600
                    ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? 'Sair' : undefined}
                aria-label="Sair da conta"
            >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
            </button>
        </div>
    )
}