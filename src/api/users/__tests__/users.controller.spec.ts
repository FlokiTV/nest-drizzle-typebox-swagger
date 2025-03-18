import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@/providers/config/config.module';

describe('UsersController', () => {
  let controller: UsersController;

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
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
