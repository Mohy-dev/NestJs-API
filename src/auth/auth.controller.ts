/* eslint-disable */
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup') // 201 Created by default
  signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @HttpCode(200) // Or @Httpcode(HttpStatus.OK) => const enums btw
  @Post('signin')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
