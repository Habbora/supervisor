import Database from "bun:sqlite";

const getDb = (databaseUrl?: string) => {
  try {
    const db = new Database(databaseUrl || process.env.DATABASE_URL);
    return db;
  } catch (error) {
    if (Error.isError(error)) {
      console.error(error);
    }
  }
};
