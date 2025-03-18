import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/schema';
import * as Database from 'better-sqlite3';


export const DRIZZLE = Symbol('DRIZZLE');

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [],
      useFactory() {
        const sqlite = new Database('database.db');
        const db = drizzle({ client: sqlite, schema });
        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
