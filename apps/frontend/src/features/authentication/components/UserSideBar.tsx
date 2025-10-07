import { useAuth } from "@/features/auth/hooks/useAuth";

export default function UserSideBar() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        < div className="mt-auto pt-4 border-t border-gray-200 bg-gray-100" >
            <div className="flex items-center justify-between p-2 mb-2">
                <span className="text-sm font-medium text-gray-700">👤 {user?.name}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
            >
                <span>Sair</span>
            </button>
        </div >
    )
}