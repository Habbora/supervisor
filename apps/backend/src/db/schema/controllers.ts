import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const controllers = pgTable('controllers', {
    id: text().primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
    name: text().notNull(),

    // Referencia Driver
    driver: text().notNull(),
    driverId: text().notNull(),
    config: jsonb().notNull(),

    // Auditoria
    createAt: timestamp().defaultNow(),
    updateAt: timestamp().defaultNow(),
})