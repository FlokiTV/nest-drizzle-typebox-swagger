import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

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
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
