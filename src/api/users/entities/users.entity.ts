import * as t from 'drizzle-orm/sqlite-core';

export const user = t.sqliteTable('user', {
  id: t.int().primaryKey({ autoIncrement: true }),
  name: t.text('name').notNull(),
  email: t.text('email').notNull(),
  password: t.text('password').notNull(),
  lastSignAt: t.integer('lastSignAt').default(0),
  createdAt: t.integer('createdAt').$defaultFn(() => Date.now()),
  updatedAt: t
    .integer('updatedAt')
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
});
