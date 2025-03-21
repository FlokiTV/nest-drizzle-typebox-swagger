import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { checkPassword, encryptPassword, isEmailValid } from './utils';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { SelectUserDto } from '../users/dto/select-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { user } from '../users/entities/users.entity';
import { ConnectAuthDto } from './dto/connect-auth.dto';
import { Config } from '@/providers/config/config.provider';
import type { DrizzleDB } from '@/drizzle/types/drizzle';
import { DRIZZLE } from '@/drizzle/drizzle.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(Config) private cfg: Config,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  jwt(user: SelectUserDto) {
    const payload = { id: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.cfg.jwt(),
    });
    return token;
  }

  async connect(connectAuthDto: ConnectAuthDto) {
    const [userNow] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, connectAuthDto.email))
      .limit(1);

    if (!userNow) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'User not found',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (!checkPassword(connectAuthDto.password, userNow.password)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Invalid credentials',
        },
        HttpStatus.CONFLICT,
      );
    }

    // last login
    await this.db
      .update(user)
      .set({
        lastSignAt: Date.now(),
      })
      .where(eq(user.id, userNow.id));

    const token = this.jwt(userNow);

    return { user: userNow, token };
  }

  async register(createUserDto: CreateUserDto) {
    const isValidEmail = await isEmailValid(createUserDto.email);
    if (!isValidEmail) throw new ForbiddenException('Invalid email');

    await this.verifyEmailExists(createUserDto.email);

    const hashedPassword = encryptPassword(createUserDto.password);

    const [userNow] = await this.db
      .insert(user)
      .values({ ...createUserDto, password: hashedPassword })
      .returning();

    return userNow;
  }

  async verifyEmailExists(email: string) {
    const userNow = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (userNow[0]) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    return { ok: true };
  }
}
