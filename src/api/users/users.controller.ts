import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, updateUserSchema } from './dto/update-user.dto';
import { AuthGuard, Payload } from '@/guards/auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { Validate } from 'nestjs-typebox';
import { Type } from '@sinclair/typebox';
import { selectUserSchema } from './dto/select-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Unauthorized',
            },
          },
        },
      },
    },
  })
  @Validate({
    response: Type.Omit(selectUserSchema, ['password']),
  })
  me(@Request() req: Payload) {
    const user = req.user;
    return this.usersService.getById(user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('/me')
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Unauthorized',
            },
          },
        },
      },
    },
  })
  @Validate({
    response: Type.Omit(selectUserSchema, ['password']),
    request: [
      {
        type: 'body',
        schema: Type.Omit(updateUserSchema, [
          'id',
          'password',
          'lastSignAt',
          'createdAt',
          'updatedAt',
        ]),
      },
    ],
  })
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: Payload) {
    const user = req.user;
    return this.usersService.updateById(user.id, updateUserDto);
  }
}
