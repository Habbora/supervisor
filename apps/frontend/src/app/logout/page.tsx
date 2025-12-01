import { logoutAction } from "../actions/logout";

export default function LogoutPage() {
    return (
        <form action={logoutAction}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Fazendo logout...</h1>
                    <button
                        type="submit"
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Confirmar Logout
                    </button>
                </div>
            </div>
        </form>
    );
}