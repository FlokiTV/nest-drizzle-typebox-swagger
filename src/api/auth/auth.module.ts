import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Config } from '@/providers/config/config.provider';
import { DrizzleModule } from '@/drizzle/drizzle.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Config],
  imports: [
    DrizzleModule,
    JwtModule.register({
      global: true,
      secret: new TextEncoder().encode(process.env.JWT_SECRET).toString(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
})
export class AuthModule {}
