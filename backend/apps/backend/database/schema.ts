import Database  from "bun:sqlite";

export async function initializeDatabase(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      port INTEGER NOT NULL,
      host TEXT NOT NULL,
      unit_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lights (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      device_id TEXT NOT NULL,
      address INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices (id)
    );
  `);
}
