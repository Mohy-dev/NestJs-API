/* eslint-disable */
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaClientValidationError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      // you can apply guard check instead
      try {
        const valid = await argon.verify(
          user.hash,
          dto.password,
        );
        if (valid) {
          delete user.hash;
          return user;
        }
      } catch (error) {
        throw new ForbiddenException('Invalid Credentials');
      }
    }
    throw new ForbiddenException('Email Not Found');
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        }, // use select or delete
      });

      delete user.hash;

      return user;
    } catch (error) {
      if (error.code === 'P2002')
        throw new ForbiddenException(
          'Email already exists',
        );
      throw error;
    }
  }
}
