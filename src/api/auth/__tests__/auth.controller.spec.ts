import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { ConnectAuthDto } from '../dto/connect-auth.dto';
import { SignupAuthDto } from '../dto/signup-auth.dto';
import { UsersService } from '@api/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let testUserId: number | null = null;
  let usersService: UsersService;

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
      providers: [AuthService, UsersService],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    if (testUserId) {
      await usersService.deleteById(testUserId);
      testUserId = null;
    }
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
      const result = await controller.register(signupDto);
      testUserId = result.id;
      expect(result.id).toBeGreaterThan(0);
      expect(result.email).toBe(testEmail);
      expect(result.name).toBe('Test User');
    });
  });

  describe('connect (POST /login)', () => {
    it('should call authService.connect and return its result', async () => {
      const signupDto: SignupAuthDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const register = await controller.register(signupDto);
      testUserId = register.id;

      const connectDto: ConnectAuthDto = {
        email: testEmail,
        password: testPassword,
      };
      const result = await controller.connect(connectDto);

      expect(result.user.id).toBeGreaterThan(0);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe('Test User');

      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });
  });
});
