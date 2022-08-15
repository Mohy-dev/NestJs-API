import { User } from '@prisma/client';
import { JwtGuard } from './../auth/guard/jwt.guard';
/*eslint-disable*/
import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
