export enum UserRoles {
    ADMIN = "admin",
    USER = "user"
}

export type UserSchema = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRoles;
    createdAt: string;
    updatedAt: string;
}

export type UserCreateSchema = Omit<UserSchema, "id" | "createdAt" | "updatedAt">;