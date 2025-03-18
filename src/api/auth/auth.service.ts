import { join } from 'path';
import { readFile } from 'fs/promises';
import type { DrizzleDB } from '@/drizzle/legacy/types/drizzle';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Req,
} from '@nestjs/common';
import {
  checkPassword,
  encryptPassword,
  generateOTP,
  generateToken,
  isEmailValid,
} from './utils';
import { JwtService } from '@nestjs/jwt';
import { and, eq, gt } from 'drizzle-orm';
import { formatDate } from '@/drizzle/utils';
import { Request } from 'express';
import { Config } from 'common/providers/config/config';
import { SMTPService } from 'common/mail/smtp/smtp.service';
import { SelectUserDto } from '../users/dto/select-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { tokens, TokenType, user } from '../users/entities/users.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ConnectAuthDto } from './dto/connect-auth.dto';
import { DRIZZLE_LEGACY } from '@/drizzle/legacy/drizzle.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(Config) private cfg: Config,
    @Inject(SMTPService) private mailService: SMTPService,
    @Inject(DRIZZLE_LEGACY) private db: DrizzleDB,
  ) {}

  jwt(user: SelectUserDto) {
    const payload = { idUser: user.id };
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

    if (!(await checkPassword(connectAuthDto.password, userNow.password))) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Incorrect password',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (this.cfg.useEmailVerification() && userNow.email_confirmed === false) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Account not verified',
          code: 'EMAIL_NOT_VERIFIED',
        },
        HttpStatus.CONFLICT,
      );
    }

    // last login
    await this.db
      .update(user)
      .set({
        last_sign_in_at: new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
      } as UpdateUserDto)
      .where(eq(user.id, userNow.id));

    const token = this.jwt(userNow);

    return { user: userNow, token };
  }

  async register(@Req() req: Request, createUserDto: CreateUserDto) {
    // const clientIp = req.ip; //TODO - get client ip
    const isValidEmail = await isEmailValid(createUserDto.email);
    if (!isValidEmail) throw new ForbiddenException('Invalid email');

    await this.verifyEmailExists(createUserDto.email);

    const hashedPassword = await encryptPassword(createUserDto.password);

    const userNow = await this.db
      .insert(user)
      .values({ ...createUserDto, password: hashedPassword })
      .$returningId();

    if (this.cfg.useEmailVerification()) {
      await this.sendEmailVerification(createUserDto.email);
    }

    return {
      ok: true,
    };
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

  async activeAccount(incomeToken: string) {
    const [tokenData] = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.token, incomeToken),
          eq(tokens.type, 'email_confirmation' as TokenType),
          gt(tokens.expiresAt, formatDate()),
          eq(tokens.used, false),
        ),
      )
      .limit(1);

    if (!tokenData) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Token not found',
        },
        HttpStatus.CONFLICT,
      );
    }

    // active user
    await this.db
      .update(user)
      .set({
        email_confirmed: true,
      } as UpdateUserDto)
      .where(eq(user.id, tokenData.userId));

    //use token
    await this.db
      .update(tokens)
      .set({ used: true })
      .where(eq(tokens.id, tokenData.id));

    // await this.db.query.user.findFirst({
    //   where: (user, { eq }) => eq(user.id, tokenData.userId),
    // });

    return { ok: true };
  }

  async sendEmailVerification(email: string) {
    const [userNow] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!userNow) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'User not found',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (userNow.email_confirmed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Account already verified',
        },
        HttpStatus.CONFLICT,
      );
    }

    const [query] = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.userId, userNow.id),
          eq(tokens.type, 'email_confirmation' as TokenType),
          gt(tokens.expiresAt, formatDate()),
          eq(tokens.used, false),
        ),
      );

    const createdAtMs = new Date(query.createdAt).getTime();
    const timeoutMs = this.cfg.resendTimeout();
    const now = Date.now();

    if (query && now < createdAtMs + timeoutMs) {
      throw new ForbiddenException('Wait 2 minutes to resend the email');
    }

    const token = generateToken();

    await this.db.insert(tokens).values({
      token: token,
      type: 'email_confirmation' as TokenType,
      userId: userNow.id,
      expiresAt: formatDate(
        new Date(Date.now() + this.cfg.verificationEmailExpires()),
      ),
    });

    let html = await readFile(join(process.cwd(), 'templates/welcome.html'), {
      encoding: 'utf-8',
    });

    html = html.replaceAll('{{user}}', userNow.name);
    html = html.replaceAll(
      '{{url}}',
      `https://hub.dactai.com.br/auth/account/activate/${token}`,
    );

    await this.mailService.send({
      to: [userNow.email],
      subject: 'Confirmar seu email - Dactai HUB',
      html: html,
    });

    return { ok: true };
  }

  async sendPasswordReset(email: string) {
    const [userNow] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!userNow) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'User not found',
        },
        HttpStatus.CONFLICT,
      );
    }

    const [existsToken] = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.userId, userNow.id),
          eq(tokens.type, 'password_reset' as TokenType),
          gt(tokens.expiresAt, formatDate()),
          eq(tokens.used, false),
        ),
      );

    if (
      existsToken &&
      Date.now() <
        new Date(existsToken.createdAt).getTime() + this.cfg.resendTimeout()
    ) {
      throw new ForbiddenException('Wait 2 minutes to resend the email');
    }

    const optToken = generateOTP();

    await this.db.insert(tokens).values({
      token: optToken,
      type: 'password_reset' as TokenType,
      userId: userNow.id,
      expiresAt: formatDate(
        new Date(Date.now() + this.cfg.verificationPasswordExpires()),
      ),
    });

    let html = await readFile(join(process.cwd(), 'templates/otp.html'), {
      encoding: 'utf-8',
    });

    html = html.replaceAll(
      '{{text}}',
      `Seu código é valido por 5 minutos.<br>Use o código abaixo para resetar sua senha:`,
    );
    html = html.replaceAll('{{code}}', optToken);

    await this.mailService.send({
      to: [userNow.email],
      subject: 'Recuperar senha - Dactai HUB',
      html: html,
    });

    return { ok: true };
  }

  async resetPassword(token: string, password: string) {
    const [existsToken] = await this.db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.token, token),
          eq(tokens.type, 'password_reset' as TokenType),
          gt(tokens.expiresAt, formatDate()),
          eq(tokens.used, false),
        ),
      );

    if (!existsToken) {
      throw new ForbiddenException('Token not found');
    }

    await this.db
      .update(user)
      .set({ password: await encryptPassword(password) })
      .where(eq(user.id, existsToken.userId));

    await this.db
      .update(tokens)
      .set({ used: true })
      .where(eq(tokens.id, existsToken.id));

    return { ok: true };
  }
}
