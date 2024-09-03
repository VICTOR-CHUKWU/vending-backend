import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { UserLoginDto } from './dto/auth-login.dto';
import { BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}
  private User = this.databaseService.user;

  async signup(userSignupDto: Prisma.UserCreateInput) {
    console.log('is controller called', userSignupDto);
    const isUser = await this.User.findUnique({
      where: {
        email: userSignupDto.email,
      },
    });
    if (isUser) {
      throw new BadRequestException('Email already exist ');
    }
    const hashedPassword = await bcrypt.hash(userSignupDto.password, 10);

    const user = await this.User.create({
      data: {
        ...userSignupDto,
        password: hashedPassword,
      },
    });
    const token = this.generateToken(user);
    return { ...user, token };
  }

  async signin(userLoginDto: UserLoginDto) {
    const user = await this.databaseService.user.findUnique({
      where: {
        email: userLoginDto.email,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      userLoginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { ...user, token };
  }

  private generateToken(user: Prisma.UserCreateInput) {
    const payload = { email: user.email, role: user.role, id: user.id };
    return this.jwtService.sign(payload);
  }
}
