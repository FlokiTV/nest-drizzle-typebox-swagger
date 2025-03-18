import { Static, Type } from '@sinclair/typebox';
import { createInsertSchema } from 'drizzle-typebox';
import { user } from '../entities/users.entity';

export const creatUserSchema = createInsertSchema(user, {
  name: Type.String({
    minLength: 1,
  }),
  email: Type.String({
    format: 'email',
  }),
  password: Type.String({
    minLength: 8,
  }),
});
export type CreateUserDto = Static<typeof creatUserSchema>;
