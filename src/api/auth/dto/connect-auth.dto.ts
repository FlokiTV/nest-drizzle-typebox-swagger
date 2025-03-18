import { Static, Type } from '@sinclair/typebox';

export const ConnectAuthSchema = Type.Object({
  email: Type.String({
    description: "The user's email address",
  }),
  password: Type.String({
    description: "The user's password",
    minLength: 8,
  }),
});

export type ConnectAuthDto = Static<typeof ConnectAuthSchema>;
