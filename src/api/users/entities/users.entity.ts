import * as t from 'drizzle-orm/sqlite-core';

export const user = t.sqliteTable('user', {
  id: t.int().primaryKey({ autoIncrement: true }),
  name: t.text('name'),
  email: t.text('email'),
  phone: t.text('phone'),
  date: t.text('date'),
  address: t.text('address'),
  createdAt: t.integer('createdAt').$defaultFn(() => Date.now()),
  updatedAt: t
    .integer('updatedAt')
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
});