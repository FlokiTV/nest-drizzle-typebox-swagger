import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/common/drizzle/schema/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: 'database.db',
  },
});
