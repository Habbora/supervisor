import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

// Inicializa o banco de dados SQLite
const sqlite = new Database('data/db.sqlite');

// Cria a instância do Drizzle com o schema
export const db = drizzle(sqlite, { schema });

// Exporta o schema para uso em outros arquivos
export * from './schema'; 