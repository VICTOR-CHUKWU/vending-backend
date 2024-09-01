import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';

import { UsersService } from './users.service';
import { createResponse, JwtAuthGuard } from '../../common/utils';
import { BuyerRoleInterceptor } from 'src/common/interceptors/buyerRole.interceptor';
import { TokenDto } from './dto/user.dto';
import { AuthorizationInterceptor } from 'src/common/interceptors/authorization.interceptor';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get()
  async getAllUsers(@Res() res: Response, @Query('role') role?: string) {
    let roleEnum: Role | undefined;

    if (role) {
      if (Object.values(Role).includes(role as Role)) {
        roleEnum = role as Role;
      } else {
        throw new BadRequestException('Invalid role in params');
      }
    }
    const users = await this.userService.getAllUsers(roleEnum);
    createResponse(res, HttpStatus.OK, 'Users fetched successfully', users);
  }

  @Post('buy-coin/:id')
  @UseInterceptors(AuthorizationInterceptor)
  @UseInterceptors(BuyerRoleInterceptor)
  async buyCoin(
    @Param('id') id: string,
    @Body() tokenPayload: TokenDto,
    @Res() res: Response,
  ) {
    const coin = await this.userService.buyCoin(id, tokenPayload);
    return createResponse(
      res,
      HttpStatus.OK,
      'coin purchased successfully',
      coin,
    );
  }

  @Get('coin/:id')
  @UseInterceptors(AuthorizationInterceptor)
  @UseInterceptors(BuyerRoleInterceptor)
  async getCoin(@Param('id') id: string, @Res() res: Response) {
    const coin = await this.userService.getCoin(id);
    return createResponse(
      res,
      HttpStatus.OK,
      'coin fetched successfully',
      coin,
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.getUser(id);
    createResponse(res, HttpStatus.OK, 'Users fetched successfully', user);
  }

  @Patch(':id')
  @UseInterceptors(AuthorizationInterceptor)
  async updateUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    createResponse(res, HttpStatus.OK, 'Users updated successfully', user);
  }

  @Delete(':id')
  @UseInterceptors(AuthorizationInterceptor)
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.deleteUser(id);
    createResponse(res, HttpStatus.OK, 'Users deleted successfully', user);
  }

  @Post('reset-coin/:id')
  @UseInterceptors(AuthorizationInterceptor)
  @UseInterceptors(BuyerRoleInterceptor)
  async resetUserToken(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.resetCoin(id);
    createResponse(res, HttpStatus.OK, 'Users coin reseted successfully', user);
  }
}
