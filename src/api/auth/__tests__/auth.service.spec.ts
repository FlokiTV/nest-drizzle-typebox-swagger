import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { SignupAuthDto } from '../dto/signup-auth.dto';
import { ConnectAuthDto } from '../dto/connect-auth.dto';
import { UsersService } from '@api/users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let testUserId: number | null = null;
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
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    if (testUserId) {
      await usersService.deleteById(testUserId);
      testUserId = null;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and return user data', async () => {
      const signupDto: SignupAuthDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const result = await service.register(signupDto);
      testUserId = result.id;
      expect(result.id).toBeGreaterThan(0);
      expect(result.email).toBe(testEmail);
      expect(result.name).toBe('Test User');
    });
  });

  describe('connect', () => {
    it('should return user and token when credentials are correct', async () => {
      const signupDto: SignupAuthDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const registeredUser = await service.register(signupDto);
      testUserId = registeredUser.id;

      const connectDto: ConnectAuthDto = {
        email: testEmail,
        password: testPassword,
      };

      const result = await service.connect(connectDto);
      expect(result.user.id).toBeGreaterThan(0); // Verifica que o ID é um número válido
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe('Test User');

      // Verifica se o token é uma string não vazia
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should throw an error if user is not found', async () => {
      const connectDto: ConnectAuthDto = {
        email: 'nonexistent@example.com',
        password: testPassword,
      };

      await expect(service.connect(connectDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw an error if password is incorrect', async () => {
      const signupDto: SignupAuthDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const registeredUser = await service.register(signupDto);
      testUserId = registeredUser.id;

      const connectDto: ConnectAuthDto = {
        email: testEmail,
        password: 'wrongpassword',
      };

      await expect(service.connect(connectDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
