import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DrizzleModule,
        ConfigModule,
        JwtModule.register({
          global: true,
          secret: new TextEncoder().encode(process.env.JWT_SECRET).toString(),
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
