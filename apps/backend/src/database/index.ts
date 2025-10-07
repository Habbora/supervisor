import { DatabaseConnection } from "./connection";
import { MigrationManager } from "./migrations";
import { LoggerService } from "./services/LoggerService.ts";
import { UserService } from "./services/UserService.ts";

export class DatabaseManager {
    private static instance: DatabaseManager;
    public userService = new UserService();
    public loggerService = new LoggerService();

    private constructor() { }

    public static async getInstance(): Promise<DatabaseManager> {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
            await DatabaseManager.instance.initialize();
        }
        return DatabaseManager.instance;
    }

    private async initialize(): Promise<void> {
        const migrationManager = new MigrationManager()
        await migrationManager.runMigrations();
    }

    public close(): void {
        DatabaseConnection.getInstance().close();
    }
}

export const database = await DatabaseManager.getInstance();