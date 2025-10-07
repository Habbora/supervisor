import fs from "fs";
import { DatabaseConnection } from "../connection";
import path from "path";

export class MigrationManager {
    private db = DatabaseConnection.getInstance().getDatabase();

    public async runMigrations(): Promise<void> {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                hash TEXT UNIQUE NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const migrations = fs.readdirSync(path.join(__dirname));
        const migrationFiles = migrations
            .filter(file => file.endsWith('.ts') && file !== "index.ts")
            .map(file => file.replace('.ts', ''))
            .sort((a, b) => a.localeCompare(b));

        for (const migration of migrationFiles) {
            await this.runMigration(migration);
        }
    }

    private async runMigration(migrationName: string): Promise<void> {
        const props = this.db.prepare(
            'SELECT COUNT(*) AS count FROM migrations WHERE name = ?'
        ).get(migrationName) as { count: number };

        if (props.count > 0) {
            console.log(`⏭️  Migração ${migrationName} já executada`);
            return;
        }

        const file = fs.readFileSync(path.join(__dirname, `${migrationName}.ts`), 'utf8');
        const hashFile = await Bun.password.hash(file);

        try {
            const migration = await import(`./${migrationName}.ts`);
            await migration.up(this.db);

            this.db.prepare(
                'INSERT INTO migrations (name, hash) VALUES (?, ?)'
            ).run(migrationName, hashFile);

            console.log(`✅ Migração ${migrationName} executada com sucesso`);
        } catch (error) {
            console.error(`❌ Erro na migração ${migrationName}:`, error);
            throw error;
        }
    }
}