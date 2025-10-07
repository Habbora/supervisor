export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export type UserCreate = Omit<User, "id"> & { password: string };