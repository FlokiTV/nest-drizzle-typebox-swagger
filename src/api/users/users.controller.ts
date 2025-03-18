import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, Payload } from '@/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(AuthGuard)
  @Get('/me')
  me(@Request() req: Payload) {
    const user = req.user;
    return user
    // return this.usersService.me(user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('/me')
  update(@Request() req: Payload, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user;
    // return this.usersService.updateMe(user.id, updateUserDto);
  }
}
