import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationParams } from 'src/common/decorators/pagination.decorator';
import { Role } from 'src/common/enums';

import { DatabaseService } from 'src/database/database.service';
import { BuyProductDto } from './dto/buy-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  private Product = this.databaseService.product;
  private User = this.databaseService.user;
  private Purchase = this.databaseService.purchase;

  async create(createProductDto: CreateProductDto) {
    const product = await this.Product.create({ data: createProductDto });
    return product;
  }

  async findAll(pagination: PaginationParams, userRole: Role, userId?: string) {
    const { perPage, currentPage } = pagination;
    const skip = (currentPage - 1) * perPage;

    let where: Prisma.ProductWhereInput = {};

    if (userRole === Role.Seller && userId) {
      where = { sellerId: userId };
    }

    const totalDocumentCount = await this.Product.count();

    const totalPages = Math.ceil(totalDocumentCount / perPage);

    const products = await this.Product.findMany({
      skip,
      take: perPage,
      where,
    });

    return {
      products,
      pagination: {
        ...pagination,
        totalDocumentCount,
        totalPages,
      },
    };
  }

  async findAllUserPurchase(pagination: PaginationParams, userId?: string) {
    const { perPage, currentPage } = pagination;
    const skip = (currentPage - 1) * perPage;

    const totalDocumentCount = await this.Purchase.count({
      where: {
        userId,
      },
    });

    const totalPages = Math.ceil(totalDocumentCount / perPage);

    const purchases = await this.Purchase.findMany({
      where: {
        userId,
      },
      skip,
      take: perPage,
      include: {
        productPurchases: {
          include: {
            product: true,
          },
        },
      },
    });

    const formattedResult = purchases.map((purchase) => ({
      id: purchase.id,
      totalCost: purchase.totalCost,
      createdAt: purchase.createdAt,
      productPurchases: purchase.productPurchases.map((productPurchase) => ({
        id: productPurchase.id,
        quantity: productPurchase.quantity,
        product: {
          id: productPurchase.product.id,
          productName: productPurchase.product.productName,
          cost: productPurchase.product.cost,
          amountRemaining: productPurchase.product.amountRemaining,
          productImages: productPurchase.product.productImages,
        },
      })),
    }));

    return {
      purchases: formattedResult,
      pagination: {
        ...pagination,
        totalDocumentCount,
        totalPages,
      },
    };
  }

  async findOnePurchase(purchaseId: string, userId: string) {
    const purchase = await this.Purchase.findUnique({
      where: {
        id: purchaseId,
        userId,
      },
      include: {
        productPurchases: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    const formattedResult = {
      id: purchase.id,
      totalCost: purchase.totalCost,
      createdAt: purchase.createdAt,
      productPurchases: purchase.productPurchases.map((productPurchase) => ({
        id: productPurchase.id,
        quantity: productPurchase.quantity,
        product: {
          id: productPurchase.product.id,
          productName: productPurchase.product.productName,
          cost: productPurchase.product.cost,
          amountRemaining: productPurchase.product.amountRemaining,
          productImages: productPurchase.product.productImages,
        },
      })),
    };

    return formattedResult;
  }

  async findOne(id: string, userRole: Role, userId?: string) {
    const product = await this.Product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    if (userRole === Role.Seller && product.sellerId !== userId) {
      throw new ForbiddenException("Cannot view another seller's product");
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: Prisma.ProductUpdateInput,
    userId: string,
  ) {
    const isProduct = await this.Product.findFirst({
      where: {
        id,
        sellerId: userId,
      },
    });

    if (!isProduct) {
      throw new BadRequestException('Product not found');
    }
    await this.Product.update({
      where: {
        id,
        sellerId: userId,
      },
      data: {
        ...updateProductDto,
      },
    });
    return null;
  }

  async remove(id: string, userId: string) {
    const isProduct = await this.Product.findFirst({
      where: {
        id,
        sellerId: userId,
      },
    });

    if (!isProduct) {
      throw new BadRequestException('Product not found');
    }
    await this.Product.delete({
      where: {
        id,
        sellerId: userId,
      },
    });
    return null;
  }

  async buyProducts(buyProductDtos: BuyProductDto[], userId: string) {
    let totalCost = 0;
    const productPurchases = [];

    for (const buyProductDto of buyProductDtos) {
      const product = await this.Product.findUnique({
        where: { id: buyProductDto.productId },
      });

      if (!product || product.amountRemaining < buyProductDto.quantity) {
        throw new BadRequestException('Invalid product or insufficient stock');
      }

      totalCost += product.cost * buyProductDto.quantity;

      productPurchases.push({
        productId: product.id,
        quantity: buyProductDto.quantity,
      });
    }

    // Get user and check if they have enough coins
    const user = await this.User.findUnique({
      where: { id: userId },
    });

    if (user.coins < totalCost) {
      throw new BadRequestException('Insufficient coins');
    }

    // Deduct coins and create the purchase
    await this.User.update({
      where: { id: userId },
      data: {
        coins: { decrement: totalCost },
      },
    });

    const purchase = await this.Purchase.create({
      data: {
        userId: userId,
        totalCost: totalCost,
        productPurchases: {
          create: productPurchases,
        },
      },
      include: {
        productPurchases: {
          include: {
            product: true,
          },
        },
      },
    });

    for (const pp of productPurchases) {
      await this.Product.update({
        where: { id: pp.productId },
        data: {
          amountRemaining: { decrement: pp.quantity },
        },
      });
    }

    return {
      remainingCoins: user.coins - totalCost,
      purchase,
    };
  }
}
