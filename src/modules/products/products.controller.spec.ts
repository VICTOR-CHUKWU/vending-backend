import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Response } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { BuyProductDto } from './dto/buy-product.dto';

jest.mock('./products.service');

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            buyProducts: jest.fn(),
            findAll: jest.fn(),
            findAllUserPurchase: jest.fn(),
            findOnePurchase: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Test Product',
        cost: 100,
        amountRemaining: 10,
        productImages: ['image1.jpg'],
        sellerId: '11',
      };

      // Define the product object as it would be returned by Prisma
      const createdProduct = {
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createProductDto,
        productImages: createProductDto.productImages ?? [],
      };
      // Mock the service's create method to return the created product
      jest.spyOn(service, 'create').mockResolvedValue(createdProduct);

      await controller.create(createdProduct, res);

      // Assertions
      expect(service.create).toHaveBeenCalledWith(createdProduct);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: 'Product created successfully',
        data: createdProduct,
        pagination: null,
      });
    });
  });

  describe('buyProduct', () => {
    it('should buy products', async () => {
      const buyProductDto: BuyProductDto[] = [{ productId: '1', quantity: 2 }];
      const userId = 'a52130b7-6d72-4ced-81c1-fd0d1992de6e';
      const product = {
        id: 'a4238e29-923f-4f7f-97c8-d5c60fab2147',
        cost: 9,
        amountRemaining: 150,
        productName: 'Wireless Mouse',
        productImages: [],
        sellerId: 'bbe6a3e6-e50a-491e-9eb1-1f6760cda0d8',
        createdAt: new Date('2024-09-01T15:17:57.016Z'),
        updatedAt: new Date('2024-09-01T18:21:07.124Z'),
      }; // Mock product
      const purchaseResult = {
        remainingCoins: 0,
        purchase: {
          id: '252f8872-ac8a-43ba-a382-4cf563c05caa',
          userId: userId,
          totalCost: 18,
          createdAt: new Date('2024-09-01T18:31:57.168Z'),
          productPurchases: [
            {
              id: 'bc1f15ca-f25a-4e55-aea0-0af403bf7255',
              productId: product.id,
              purchaseId: '252f8872-ac8a-43ba-a382-4cf563c05caa',
              quantity: 2,
              product: {
                ...product,
              },
            },
          ],
        },
      };

      // Mock the service's buyProducts method
      jest.spyOn(service, 'buyProducts').mockResolvedValue(purchaseResult);

      await controller.buyProduct(buyProductDto, res, userId);

      // Assertions
      expect(service.buyProducts).toHaveBeenCalledWith(buyProductDto, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: 'Product purchased successfully',
        data: purchaseResult,
        pagination: null,
      });
    });
  });
});
