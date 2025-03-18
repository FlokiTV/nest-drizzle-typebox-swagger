import { Static, Type } from '@sinclair/typebox';

export const ResetPassSchema = Type.Object({
  password: Type.String({
    description: 'Password',
    minLength: 8,
  }),
});

export type ResetPassDto = Static<typeof ResetPassSchema>;
