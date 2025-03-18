import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DrizzleModuleLegacy } from '@/drizzle/legacy/drizzle.module';
import { JwtModule } from '@nestjs/jwt';
import { SMTPModule } from 'common/mail/smtp/smtp.module';
import { Config } from '@/providers/config/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Config],
  imports: [
    DrizzleModuleLegacy,
    JwtModule.register({
      global: true,
      secret: new TextEncoder().encode(process.env.JWT_SECRET).toString(),
      signOptions: { expiresIn: '24h' },
    }),
    SMTPModule,
  ],
})
export class AuthModule {}
