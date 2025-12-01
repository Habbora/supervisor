"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";

export const useAuth = () => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadAuthData = async () => {
        try {
            const storedToken = getTokenFromCookies();
            if (!storedToken) {
                setIsLoading(false);
                logout();
                return;
            }

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

    useEffect(() => {
        loadAuthData();
    }, []);

    const getTokenFromCookies = (): string | null => {
        if (typeof document === 'undefined') return null;
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
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

            console.log('Validando token response:', response);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            console.log('Validando token:', data);

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
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        console.log(response.ok)

        if (!response.ok) {
            throw new Error('Erro ao fazer login.');
        }

        const data = await response.json();

        if (!data.token || !data.user) {
            throw new Error('Erro ao fazer login.');
        }

        document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

        setToken(data.token);
        setUser(data.user);

        router.push("/");
    }

    const logout = async () => {
        setIsLoading(true);

        try {
            const pastDate = new Date(0).toUTCString();
            document.cookie = `auth-token=; path=/; expires=${pastDate}`;
            document.cookie = `auth-token=; path=/; max-age=0`;
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
        isLoading
    };
};