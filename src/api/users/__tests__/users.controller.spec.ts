import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { ConfigModule } from '@/providers/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthService } from '@api/auth/auth.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let testUserId: number | null = null;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        DrizzleModule,
        JwtModule.register({
          global: true,
          secret: new TextEncoder().encode(process.env.JWT_SECRET).toString(),
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [UsersService, AuthService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (testUserId) {
      await usersService.deleteById(testUserId);
      testUserId = null;
    }
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      const signupDto: CreateUserDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const user = await authService.register(signupDto);
      testUserId = user.id;

      const foundUser = await usersService.getById(user.id);
      expect(foundUser).toMatchObject({
        id: user.id,
        email: testEmail,
        name: 'Test User',
      });
    });

    it('should throw an exception if user does not exist', async () => {
      await expect(usersService.getById(9999)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const signupDto: CreateUserDto = {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      };

      const user = await authService.register(signupDto);
      testUserId = user.id;

      const updatedUser = await usersService.updateById(user.id, {
        name: 'Updated Name',
      });

      expect(updatedUser.name).toBe('Updated Name');
    });
  });
});
