import { Database } from "..";
import type { UserCreateSchema, UserRoles, UserSchema } from "./schema";

export class UserDatabase {
    private static instance: UserDatabase;

    private constructor() {
        this.initDatabase();
    }

    public static getInstance(): UserDatabase {
        if (!UserDatabase.instance) {
            UserDatabase.instance = new UserDatabase();
        }
        return UserDatabase.instance;
    }

    public initDatabase(): boolean {
        const database = Database.getInstance().readDatabase();

        if (!database.users) {
            database.users = [];
            this.create({
                email: "admin",
                name: "Admin",
                password: "admin",
                role: "admin" as UserRoles
            });
        }

        Database.getInstance().writeDatabase(database);
        return true;
    }

    public findAll(): UserSchema[] {
        const database = Database.getInstance().readDatabase();
        return database.users;
    }

    public findById(id: string): UserSchema | undefined {
        const database = Database.getInstance().readDatabase();
        return database.users.find((u: UserSchema) => u.id === id);
    }

    public findByEmail(email: string): UserSchema | undefined {
        const database = Database.getInstance().readDatabase();
        return database.users.find((u: UserSchema) => u.email === email);
    }

    public create(user: UserCreateSchema): UserSchema | undefined {
        const database = Database.getInstance().readDatabase();

        if (!user.name || !user.email || !user.password || !user.role)
            return undefined;

        const newUser: UserSchema = {
            ...user,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (database.users.find((u: UserSchema) => u.email === user.email))
            return undefined;

        database.users.push(newUser);
        Database.getInstance().writeDatabase(database);
        return newUser;
    }

    public update(user: UserSchema): UserSchema | undefined {
        if (!user.id || !user.name || !user.email || !user.password || !user.role) return undefined;

        const database = Database.getInstance().readDatabase();
        const oldUser = this.findById(user.id);
        if (!oldUser) return undefined;

        database.users = database.users.map((u: UserSchema) => u.id === user.id ? user : u);
        Database.getInstance().writeDatabase(database);
        return oldUser;
    }

    public updatePartial(id: string, updates: Partial<UserSchema>): UserSchema | undefined {
        const database = Database.getInstance().readDatabase();
        const userIndex = database.users.findIndex((u: UserSchema) => u.id === id);

        if (userIndex === -1) return undefined;

        const updatedUser = {
            ...database.users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        database.users[userIndex] = updatedUser;
        Database.getInstance().writeDatabase(database);
        return updatedUser;
    }

    public delete(id: string): UserSchema | undefined {
        const database = Database.getInstance().readDatabase();
        const index = database.users.findIndex((u: UserSchema) => u.id === id);
        if (index !== -1) {
            const deletedUser = database.users[index];
            database.users.splice(index, 1);
            Database.getInstance().writeDatabase(database);
            return deletedUser;
        }
    }
}