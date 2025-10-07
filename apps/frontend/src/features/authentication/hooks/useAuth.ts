"use client";

import { useEffect, useState } from "react";
import { User } from "../types/User";
import { useRouter } from "next/navigation";

export const useAuth = () => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setToken(token);
        }

        const localUser = localStorage.getItem("user");
        if (localUser) {
            setUser(JSON.parse(localUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        router.push("/");
    }

    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
    }

    return { user, token, login, logout };
};