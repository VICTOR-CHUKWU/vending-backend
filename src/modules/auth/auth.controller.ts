import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

import { AuthService } from './auth.service';
import { createResponse } from '../../common/utils';
import { UserLoginDto } from './dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(
    @Body() userSignupDto: Prisma.UserCreateInput,
    @Res() res: Response,
  ) {
    console.log('error here');
    const user = await this.authService.signup(userSignupDto);
    createResponse(res, HttpStatus.OK, 'User created successfully', user);
  }

  @Post('signin')
  async login(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    const user = await this.authService.signin(userLoginDto);
    createResponse(res, HttpStatus.OK, 'User logged in successfully', user);
  }
}
