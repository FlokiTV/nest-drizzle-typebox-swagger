import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPassDto } from './dto/reset-pass-auth.dto';
import { Request } from 'express';
import { Validate } from 'nestjs-typebox';
import { ConnectAuthDto, ConnectAuthSchema } from './dto/connect-auth.dto';
import { SignupAuthDto, SignupAuthSchema } from './dto/signup-auth.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Type } from '@sinclair/typebox';
import { selectUserSchema } from '../users/dto/select-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiResponse({
    status: 204,
    description: 'User not found',
    content: {
      'application/json': {
        examples: {
          userNotFound: {
            summary: 'Response',
            value: {
              statusCode: 204,
              message: 'User not found',
            },
          },
        },
      },
    },
  })
  @Validate({
    request: [
      {
        type: 'body',
        schema: ConnectAuthSchema,
      },
    ],
    response: Type.Object({
      user: Type.Omit(selectUserSchema, ['password']),
      token: Type.String(),
    }),
  })
  connect(@Body() connectAuthDto: ConnectAuthDto) {
    return this.authService.connect(connectAuthDto);
  }

  @Post('/signup')
  @ApiResponse({
    status: 203,
    description: 'Invalid email',
    content: {
      'application/json': {
        examples: {
          invalidEmail: {
            summary: 'Response',
            value: {
              statusCode: 203,
              message: 'Invalid email',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    content: {
      'application/json': {
        examples: {
          emailExists: {
            summary: 'Response',
            value: {
              statusCode: 409,
              message: 'Email already exists',
            },
          },
        },
      },
    },
  })
  @Validate({
    request: [
      {
        type: 'body',
        schema: SignupAuthSchema,
      },
    ],
    response: Type.Omit(selectUserSchema, ['password']),
  })
  register(@Body() createUserDto: SignupAuthDto) {
    return this.authService.register(createUserDto);
  }
}
