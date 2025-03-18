import { Static, Type } from '@sinclair/typebox';

export const SignupAuthSchema = Type.Object({
  name: Type.String({
    description: "The user's name",
    minLength: 1,
  }),
  email: Type.String({
    description: "The user's email address",
  }),
  password: Type.String({
    description: "The user's password",
    minLength: 8,
  }),
});

export type SignupAuthDto = Static<typeof SignupAuthSchema>;
