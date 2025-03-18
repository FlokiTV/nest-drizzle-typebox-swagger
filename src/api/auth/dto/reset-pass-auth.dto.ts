import { Static, Type } from '@sinclair/typebox';

const ResetPassSchema = Type.Object({
  password: Type.String({
    description: 'Password',
  }),
});

export type ResetPassDto = Static<typeof ResetPassSchema>;
