// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, type InferSelectModel } from 'drizzle-orm';
import { pgTableCreator, pgEnum } from 'drizzle-orm/pg-core';

export const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum('user_roles', userRoles);

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `next-auth-v2_${name}`);

export const users = createTable('user', (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.text().notNull(),
    email: d.text().notNull().unique(),
    password: d.text().notNull(),
    salt: d.varchar({ length: 256 }).notNull(),
    role: userRoleEnum().notNull().default('user'),
    createdAt: d
        .timestamp({ withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
export type TUser = InferSelectModel<typeof users>;
