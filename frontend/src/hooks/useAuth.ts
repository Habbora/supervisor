"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";

export const useAuth = () => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = getTokenFromCookies();
                if (!storedToken) return;
                const authResult = await validateToken(storedToken);
                if (authResult && authResult.valid) {
                    setUser(authResult.user);
                    setToken(storedToken);
                }
            } catch (error) {
                console.error("Error validating token", error);
                logout();
            } finally {
                setIsLoading(false);
            }
        }
        loadAuthData();
    }, []);

    const getTokenFromCookies = (): string | null => {
        if (typeof document === 'undefined') return null;

        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie =>
            cookie.trim().startsWith('auth-token=')
        );

        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const validateToken = async (t: string) => {
        try {
            const response = await fetch("/api/auth/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${t}`
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            return {
                user: data.user,
                valid: true,
            };
        } catch (error) {
            console.error("Error validating token", error);
            return null;
        }
    }

    const login = async (username: string, password: string) => {
        if (!username || !password) {
            throw new Error("Username and password are required");
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error logging in");
            }

            const data = await response.json();

            if (!data.token || !data.user) {
                throw new Error("Invalid login response");
            }

            document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

            setToken(data.token);
            setUser(data.user);

            router.push("/");

        } catch (error) {
            console.error("Error logging in", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        if (!token && !user) {
            console.warn("User is not logged in");
            return;
        }

        setIsLoading(true);

        try {
            document.cookie = "auth-token=; path=/; max-age=0; SameSite=Strict";
            setToken(null);
            setUser(null);
            router.replace("/login");
        } catch (error) {
            console.error("Error logging out", error);
            setToken(null);
            setUser(null);
            router.replace("/login");
        } finally {
            setIsLoading(false);
        }
    }

    return {
        user,
        token,
        login,
        logout,
        isLoading // ✅ NOVO: Para mostrar loading na inicialização
    };
};