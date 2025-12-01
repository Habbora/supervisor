import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const drivers = pgTable('drivers', {
  id: text().primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  // Metadados
  name: text().notNull().unique(),
  version: integer().notNull(),
  description: text(),
  // Dados
  code: text().notNull(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Driver Instances - Instâncias de drivers em runtime
 *
 * Representa objetos criados a partir de um driver (ex: "PLC Sala 1", "PLC Sala 2")
 * Cada instância tem configuração e estado independentes
 */
export const driverInstances = pgTable('driver_instances', {
  id: text().primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  // Relacionamento com driver
  driverId: text().notNull()
    .references(() => drivers.id, { onDelete: 'cascade' }),
  // Identificação da instância
  name: varchar('name', { length: 100 }).notNull(),
  // Configuração específica desta instância (host, port, etc)
  config: jsonb('config').notNull(),
  // Informações de runtime (opcional, para debug)
  lastError: text('last_error'),
  lastStartedAt: timestamp('last_started_at'),
  lastStoppedAt: timestamp('last_stopped_at'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
