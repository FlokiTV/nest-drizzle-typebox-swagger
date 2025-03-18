import { Static } from '@sinclair/typebox';
import { createInsertSchema } from 'drizzle-typebox';
import { user } from '../entities/users.entity';

export const creatUserSchema = createInsertSchema(user);
export type CreateUserDto = Static<typeof creatUserSchema>;
