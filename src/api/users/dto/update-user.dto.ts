import { Static } from '@sinclair/typebox';
import { createUpdateSchema } from 'drizzle-typebox';
import { user } from '../entities/users.entity';

export const updateUserSchema = createUpdateSchema(user);
export type UpdateUserDto = Static<typeof updateUserSchema>;
