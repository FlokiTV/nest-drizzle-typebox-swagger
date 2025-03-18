import { ConfigModule } from '@/providers/config/config.module';
import { AuthModule } from '@api/auth/auth.module';
import { UsersModule } from '@api/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
