import { Static, Type } from '@sinclair/typebox';

export const SignupAuthSchema = Type.Object({
  name: Type.String({
    default: 'John Doe',
    description: "The user's name",
  }),
  email: Type.String({
    default: 'test@example.com',
    description: "The user's email address",
  }),
  password: Type.String({
    default: 'password123',
    description: "The user's password",
  }),
});

export type SignupAuthDto = Static<typeof SignupAuthSchema>;
