import { DRIZZLE } from '@/drizzle/drizzle.module';
import type { DrizzleDB } from '@/drizzle/types/drizzle';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { user } from './entities/users.entity';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getById(id: number) {
    const me = await this.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, id),
    });
    if (!me) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'User not found',
        },
        HttpStatus.CONFLICT,
      );
    }
    return me;
  }

  async updatadeById(id: number, updateUserDto: UpdateUserDto) {
    // Check if updateUserDto is empty
    if (!Object.keys(updateUserDto).length)
      throw new ForbiddenException('Access Denied');

    await this.getById(id);

    try {
      const [success] = await this.db
        .update(user)
        .set(updateUserDto)
        .where(eq(user.id, Number(id)))
        .returning();

      if (!success) throw new Error('User not found');

      return success;
    } catch (error) {
      console.error('Error:', error);
      throw new ForbiddenException('Access Denied');
    }
  }

  async deleteById(id: number) {
    await this.getById(id);
    try {
      const [success] = await this.db
        .delete(user)
        .where(eq(user.id, Number(id)))
        .returning();

      if (!success) throw new Error('User not found');

      return success;
    } catch (error) {
      console.error('Error:', error);
      throw new ForbiddenException('Access Denied');
    }
  }
}
