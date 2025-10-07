// src/services/api/users.service.ts
import { User, UserCreate } from "@/types/entities/User";

class UsersService {
    private baseUrl = "/api/users";
    
    async createUser(user: UserCreate, token: string): Promise<User> {
        const response = await fetch(this.baseUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            method: "POST",
            body: JSON.stringify(user),
        });
        return await response.json();
    }

    async getUsers(token: string): Promise<User[]> {
        const response = await fetch(this.baseUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        return await response.json();
    }

    async getUserById(id: string, token: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        return await response.json();
    }

    async updateUser(id: string, user: User, token: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            method: "PUT",
            body: JSON.stringify(user),
        });
        return await response.json();
    }

    async deleteUser(id: string, token: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            method: "DELETE",
        });
        return await response.json();
    }
}

export const usersService = new UsersService();