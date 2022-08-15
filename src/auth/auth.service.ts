/* eslint-disable */
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(dto: AuthDto) {
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
          return this.signToken(user.id, user.email);
        }
      } catch (error) {
        throw new ForbiddenException('Invalid Credentials');
      }
    }
    throw new ForbiddenException('Email Not Found');
  }

  async signUp(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        }, // use select or delete
      });

      delete user.hash;

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error.code === 'P2002')
        throw new ForbiddenException(
          'Email already exists',
        );
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return { access_token: token };
  }
}
