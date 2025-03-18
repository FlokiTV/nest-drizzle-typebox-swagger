import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/drizzle/schema/schema.ts',
  dbCredentials: {
    url: 'database.db',
  },
});
