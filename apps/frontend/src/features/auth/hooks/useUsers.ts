import { useCallback } from "react";
import { usersService } from "@/services/api/users.service";
import { useAuth } from "./useAuth";
import { User, UserCreate } from "@/types/entities/User";

export const useUsers = () => {
    const { token } = useAuth();

    const createUser = useCallback(async (userData: UserCreate, currentToken: string) => {
        return await usersService.createUser(userData, currentToken);
    }, []);

    const readUsers = useCallback(async (currentToken: string) => {
        return await usersService.getUsers(currentToken);
    }, []);

    const readUserById = useCallback(async (id: string, currentToken: string) => {
        return await usersService.getUserById(id, currentToken);
    }, []);

    const updateUser = useCallback(async (id: string, user: User, currentToken: string) => {
        return await usersService.updateUser(id, user, currentToken);
    }, []);

    const deleteUser = useCallback(async (id: string, currentToken: string) => {
        return await usersService.deleteUser(id, currentToken)
    }, []);

    return {
        createUser,
        readUsers,
        readUserById,
        updateUser,
        deleteUser
    };
};