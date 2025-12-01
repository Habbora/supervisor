import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const loggers = pgTable('loggers', {
    id: serial().primaryKey(),
    module: text().notNull(),
    level: text().notNull(),
    message: text().notNull(),
    timestamp: timestamp().defaultNow(),
});
