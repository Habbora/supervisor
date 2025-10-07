import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private db: Database | null = null;

    private constructor() {
        this.initialize();
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    private initialize(): void {
        const databasePath = path.join(process.cwd(), "database");
        if (!fs.existsSync(databasePath)) fs.mkdirSync(databasePath, { recursive: true });

        const databaseFile = path.join(databasePath, "supervisor.db");

        this.db = new Database(databaseFile);

        // Configurar o banco para melhor performance (!Estudar)
        this.db.exec("PRAGMA journal_mode = WAL");
        this.db.exec("PRAGMA synchronous = NORMAL");
        this.db.exec("PRAGMA cache_size = 1000");
        this.db.exec("PRAGMA temp_store = MEMORY");
        this.db.exec("PRAGMA foreign_keys = ON");
    }

    public getDatabase(): Database {
        if (!this.db) throw new Error("Database not initialized");
        return this.db;
    }

    public close(): void {
        if (!this.db) return;
        this.db.close();
    }
}