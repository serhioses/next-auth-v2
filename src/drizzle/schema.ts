// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql, type InferSelectModel } from 'drizzle-orm';
import { pgTableCreator, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

export const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum('user_roles', userRoles);

export const createTable = pgTableCreator((name) => `next-auth-v2_${name}`);

export const users = createTable('user', (d) => {
    return {
        id: d.uuid().primaryKey().defaultRandom(),
        name: d.text().notNull(),
        email: d.text().notNull().unique(),
        password: d.text(),
        salt: d.varchar({ length: 256 }),
        role: userRoleEnum().notNull().default('user'),
        createdAt: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    };
});
export type TUser = InferSelectModel<typeof users>;

export const userRelations = relations(users, ({ many }) => {
    return {
        oAuthAccounts: many(userOAuthAccounts),
    };
});
export const oAuthProviders = ['discord', 'github'] as const;
export type TOAuthProvider = (typeof oAuthProviders)[number];
export const oAuthProviderEnum = pgEnum('oauth_provides', oAuthProviders);

export const userOAuthAccounts = createTable(
    'user_oauth_account',
    (d) => {
        return {
            userId: d
                .uuid()
                .notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
            provider: oAuthProviderEnum().notNull(),
            providerAccountId: d.text().notNull().unique(),
            createdAt: d
                .timestamp({ withTimezone: true })
                .default(sql`CURRENT_TIMESTAMP`)
                .notNull(),
            updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
        };
    },
    (t) => [primaryKey({ columns: [t.providerAccountId, t.provider] })],
);

export const userOauthAccountRelations = relations(userOAuthAccounts, ({ one }) => {
    return {
        user: one(users, { fields: [userOAuthAccounts.userId], references: [users.id] }),
    };
});
export type TUserOauthAccount = InferSelectModel<typeof userOAuthAccounts>;
