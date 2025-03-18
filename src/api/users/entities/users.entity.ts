import {
  boolean,
  char,
  datetime,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { dbDateNow } from '../../utils';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export const user = mysqlTable('user', {
  id: char('id', { length: 36 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).default(''),
  telephone: varchar('telephone', { length: 255 }).default(''),
  fantasyName: varchar('fantasyName', { length: 255 }).default(''),
  contact: varchar('contact', { length: 255 }).default(''),
  address: varchar('address', { length: 255 }).default(''),
  fkCity: int('fkCity').default(0),
  zipCode: varchar('zipCode', { length: 255 }).default(''),
  industry: varchar('industry', { length: 255 }).default(''),
  site: varchar('site', { length: 255 }).default(''),
  referer: varchar('referer', { length: 255 }).default(''),
  password: varchar('password', { length: 255 }).notNull(),
  excluded: boolean('excluded').default(false).notNull(),
  createdAt: datetime('createdAt', { mode: 'string' }).$defaultFn(() =>
    dbDateNow(),
  ),
  updatedAt: datetime('updatedAt', { mode: 'string' })
    .$defaultFn(() => dbDateNow())
    .$onUpdateFn(() => dbDateNow()),
  plan: varchar('plan', { length: 45 }).default(''),
  email_confirmed: boolean('email_confirmed')
    // .$defaultFn(() => !Boolean(process.env.AUTH_USE_EMAIL_VERIFICATION))
    .default(false)
    .notNull(),
});

export const usersRelations = relations(user, ({ many }) => ({
  tokens: many(tokens),
}));

// Tabela de tokens
type allowedTypes = readonly ['email_confirmation', 'password_reset'];
export type TokenType = allowedTypes[number];
export type Tokens = typeof tokens.$inferSelect;
export type TokensInsert = typeof tokens.$inferInsert;

export const tokens = mysqlTable('tokens', {
  id: int('id').primaryKey().autoincrement(),
  userId: char('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(user, {
    fields: [tokens.userId],
    references: [user.id],
  }),
}));
