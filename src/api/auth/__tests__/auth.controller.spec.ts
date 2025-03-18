import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { ConnectAuthDto } from '../dto/connect-auth.dto';
import { SignupAuthDto } from '../dto/signup-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

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

  describe('register (POST /signup)', () => {
    it('should call authService.register and return its result', async () => {
      const signupDto: SignupAuthDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };
      const expectedResult = {
        id: expect.any(Number),
        email: testEmail,
        name: 'Test User',
      };
      const result = await controller.register(signupDto);
      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('connect (POST /login)', () => {
    it('should call authService.connect and return its result', async () => {
      const connectDto: ConnectAuthDto = {
        email: testEmail,
        password: testPassword,
      };
      const expectedResult = {
        user: { id: expect.any(Number), email: testEmail, name: 'Test User' },
        token: expect.any(String),
      };
      const result = await controller.connect(connectDto);
      expect(result).toMatchObject(expectedResult);
    });
  });
});
