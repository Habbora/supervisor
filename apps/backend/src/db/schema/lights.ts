import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const lights = pgTable('lights', {
    id: text().primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
    name: text().notNull(),
    controllerId: text().notNull(),
    endpointName: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
})