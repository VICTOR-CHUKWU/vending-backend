import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { TokenDto } from './dto/user.dto';
import { BuyerRoleInterceptor } from 'src/common/interceptors/buyerRole.interceptor';
import { AuthorizationInterceptor } from 'src/common/interceptors/authorization.interceptor';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserService = {
    getAllUsers: jest.fn(),
    buyCoin: jest.fn(),
    getCoin: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    resetCoin: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        AuthorizationInterceptor,
        BuyerRoleInterceptor,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users when role is valid', async () => {
      const res = mockResponse();
      const mockUsers = [{ id: '1', name: 'Test User' }];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await controller.getAllUsers(res, Role.Buyer);

      expect(service.getAllUsers).toHaveBeenCalledWith(Role.Buyer);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: 'Users fetched successfully',
        data: mockUsers,
        pagination: null,
      });
    });

    it('should throw BadRequestException if role is invalid', async () => {
      const res = mockResponse();

      await expect(controller.getAllUsers(res, 'INVALID_ROLE')).rejects.toThrow(
        BadRequestException,
      );

      expect(service.getAllUsers).not.toHaveBeenCalled();
    });
  });

  describe('buyCoin', () => {
    it('should return the purchased coin when the request is valid', async () => {
      const res = mockResponse();
      const id = '1';
      const tokenPayload: TokenDto = { coinValue: 10 };
      const mockUser = { id: '1', coins: 20 }; // User will have 10 + 10 coins after purchase
      mockUserService.buyCoin.mockResolvedValue(mockUser);

      await controller.buyCoin(id, tokenPayload, res);

      expect(service.buyCoin).toHaveBeenCalledWith(id, tokenPayload);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status: 200,
        message: 'coin purchased successfully',
        data: mockUser,
        pagination: null,
      });
    });

    // it('should throw BadRequestException for invalid coin value', async () => {
    //   const res = mockResponse();
    //   const id = '1';
    //   const tokenPayload: any = { coinValue: 15 }; // Invalid coin value

    //   await expect(controller.buyCoin(id, tokenPayload, res)).rejects.toThrow(
    //     BadRequestException,
    //   );
    //   expect(service.buyCoin).not.toHaveBeenCalled();
    // });

    it('should throw NotFoundException if user does not exist', async () => {
      const res = mockResponse();
      const id = '1';
      const tokenPayload: TokenDto = { coinValue: 10 };
      mockUserService.buyCoin.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.buyCoin(id, tokenPayload, res)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user role is not "Buyer"', async () => {
      const req = {
        user: { id: '1', role: 'Seller' }, // Not a "Buyer"
      };
      const context = { switchToHttp: () => ({ getRequest: () => req }) };
      const next = { handle: jest.fn() };

      const buyerRoleInterceptor = new BuyerRoleInterceptor();
      await expect(
        buyerRoleInterceptor.intercept(context as any, next),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = {
        user: null, // No authenticated user
      };
      const context = { switchToHttp: () => ({ getRequest: () => req }) };
      const next = { handle: jest.fn() };

      const buyerRoleInterceptor = new BuyerRoleInterceptor();
      await expect(
        buyerRoleInterceptor.intercept(context as any, next),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user tries to buy coins for another user', async () => {
      const req = {
        user: { id: '2', role: 'Buyer' }, // Authenticated as a different user
        params: { id: '1' },
      };
      const context = { switchToHttp: () => ({ getRequest: () => req }) };
      const next = { handle: jest.fn() };

      const authorizationInterceptor = new AuthorizationInterceptor();
      await expect(
        authorizationInterceptor.intercept(context as any, next),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCoin', () => {
    it('should return the coin data', async () => {
      const res = mockResponse();
      const id = '1';
      const mockCoinData = { coins: 123 };
      mockUserService.getCoin.mockResolvedValue(mockCoinData);

      await controller.getCoin(id, res);

      expect(service.getCoin).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
