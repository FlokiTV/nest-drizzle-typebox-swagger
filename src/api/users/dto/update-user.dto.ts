import { Static, Type } from '@sinclair/typebox';
import { createUpdateSchema } from 'drizzle-typebox';
import { user } from '../entities/users.entity';

export const updateUserSchema = createUpdateSchema(user, {
  name: Type.Optional(
    Type.String({
      minLength: 1,
    }),
  ),
  email: Type.Optional(
    Type.String({
      format: 'email',
    }),
  ),
});
export type UpdateUserDto = Static<typeof updateUserSchema>;
