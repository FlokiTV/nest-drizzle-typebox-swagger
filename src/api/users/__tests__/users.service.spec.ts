import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DrizzleModule],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
