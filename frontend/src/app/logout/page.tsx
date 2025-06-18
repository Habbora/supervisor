"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Limpar localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirecionar para login
        router.replace("/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Fazendo logout...</p>
            </div>
        </div>
    );
}