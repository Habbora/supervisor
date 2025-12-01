import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
    name: text('name').notNull(),
    username: text('username').notNull().unique(),
    email: text('email'),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['super', 'admin', 'user', 'viewer'] }).default('user'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
