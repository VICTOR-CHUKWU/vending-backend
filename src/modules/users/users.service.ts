import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { Role } from '@prisma/client';
import { TokenDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  private User = this.databaseService.user;

  async getAllUsers(role?: Role) {
    if (role) {
      return await this.User.findMany({ where: { role } });
    }
    return await this.User.findMany();
  }

  async getUser(id: string) {
    const user = await this.User.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.User.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.User.delete({
      where: {
        id,
      },
    });
    return user;
  }

  async buyCoin(id: string, tokenPayload: TokenDto) {
    // Retrieve the user by ID
    const user = await this.User.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const coinValue = tokenPayload.coinValue;

    const updatedUser = await this.User.update({
      where: { id },
      data: {
        coins: user.coins + coinValue,
      },
    });

    return updatedUser;
  }

  async getCoin(id: string) {
    const user = await this.User.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { coins: user.coins };
  }

  async resetCoin(id: string) {
    const user = await this.User.update({
      where: {
        id,
      },
      data: {
        coins: 0,
      },
    });
    return user;
  }
}
