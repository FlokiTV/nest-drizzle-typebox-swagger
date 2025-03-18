import { Static, Type } from '@sinclair/typebox';

export const ConnectAuthSchema = Type.Object({
  email: Type.String({
    default: 'test@example.com',
    description: 'The user\'s email address',
  }),
  password: Type.String({
    default: 'password123',
    description: 'The user\'s password',
  }),
});

export type ConnectAuthDto = Static<typeof ConnectAuthSchema>;
