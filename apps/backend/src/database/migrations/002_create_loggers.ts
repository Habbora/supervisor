import { Database } from "bun:sqlite";

export async function up(db: Database): Promise<void> {
    db.exec(`
        CREATE TABLE IF NOT EXISTS loggers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module TEXT NOT NULL,
            level TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            message TEXT NOT NULL
        )
    `);

    db.exec('CREATE INDEX IF NOT EXISTS idx_loggers_module ON loggers(module)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_loggers_level ON loggers(level)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_loggers_message ON loggers(message)');
}