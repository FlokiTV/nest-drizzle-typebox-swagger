import { Static } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';
import { user } from '../entities/users.entity';

export const selectUserSchema = createSelectSchema(user);
export type SelectUserDto = Static<typeof selectUserSchema>;
