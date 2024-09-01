import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { Role } from '@prisma/client';

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
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
        statusCode: 200,
        message: 'Users fetched successfully',
        data: mockUsers,
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
    it('should return the purchased coin', async () => {
      const res = mockResponse();
      const id = '1';
      const tokenPayload = { coinValue: 10 };
      const mockCoin = { id: '1', token: '15' };
      mockUserService.buyCoin.mockResolvedValue(mockCoin);

      await controller.buyCoin(id, tokenPayload, res);

      expect(service.buyCoin).toHaveBeenCalledWith(id, tokenPayload);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'coin purchased successfully',
        data: mockCoin,
      });
    });
  });

  describe('getCoin', () => {
    it('should return the coin data', async () => {
      const res = mockResponse();
      const id = '1';
      const mockCoin = { id: '1', token: '123' };
      mockUserService.getCoin.mockResolvedValue(mockCoin);

      await controller.getCoin(id, res);

      expect(service.getCoin).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'coin fetched successfully',
        data: mockCoin,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return success message', async () => {
      const res = mockResponse();
      const id = '1';
      const mockUser = { id: '1', name: 'Test User' };
      mockUserService.deleteUser.mockResolvedValue(mockUser);

      await controller.deleteUser(id, res);

      expect(service.deleteUser).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Users deleted successfully',
        data: mockUser,
      });
    });
  });
});
