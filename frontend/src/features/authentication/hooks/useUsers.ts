import { User, UserCreate } from "../types/User";
import { useAuth } from "./useAuth";

export const useUsers = () => {
    const { token } = useAuth();

    const createUser = async (user: UserCreate) => {
        const response = await fetch("/api/users", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            method: "POST",
            body: JSON.stringify(user),
        });
        const data = await response.json();
        return data;
    }

    const readUsers = async () => {
        const response = await fetch("/api/users", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return data;
    }

    const readUserById = async (id: string) => {
        const response = await fetch(`/api/users/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return data;
    }

    const updateUser = async (id: string, user: User) => {
        const response = await fetch(`/api/users/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            method: "PUT",
            body: JSON.stringify(user),
        });
        const data = await response.json();
        return data;
    }

    const deleteUser = async (id: string) => {
        const response = await fetch(`/api/users/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            method: "DELETE",
        });
        const data = await response.json();
        return data;
    }

    return { createUser, readUsers, readUserById, updateUser, deleteUser };
}