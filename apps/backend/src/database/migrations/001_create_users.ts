import { Database } from "bun:sqlite";

export async function up(db: Database): Promise<void> {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user' CHECK (role IN ('super', 'admin', 'user', 'viewer')),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    const passwordHash = await Bun.password.hash('admin');

    const stmt = db.prepare('INSERT INTO users (name, username, password_hash, role) VALUES (?,?, ?, ?)');
    stmt.run('Admin', 'admin', passwordHash, 'admin');
}