import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const schedules = pgTable('schedules', {
    id: text().primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
    name: text().notNull(),
    hour: integer().notNull(),
    minute: integer().notNull(),
    isActive: boolean().notNull().default(true),
    recurrenceType: text({ enum: ['once', 'daily', 'weekly'] }).notNull().default('daily'),
    recurrenceConfig: text().default('{}'),
    actions: text().notNull(),
    nextExecution: timestamp(),
    lastExecution: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    deletedAt: timestamp()
});
