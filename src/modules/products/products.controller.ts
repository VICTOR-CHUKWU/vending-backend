import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

import { ProductsService } from './products.service';
import {
  Pagination,
  PaginationParams,
} from 'src/common/decorators/pagination.decorator';
import { PaginationInterceptor } from 'src/common/interceptors/pagination.interceptor';
import { SellerRoleInterceptor } from 'src/common/interceptors/sellerRole.interceptor';
import { createResponse, JwtAuthGuard } from 'src/common/utils';
import { User } from 'src/common/decorators/user.decorator';
import { Role } from 'src/common/enums';
import { BuyerRoleInterceptor } from 'src/common/interceptors/buyerRole.interceptor';
import { BuyProductDto } from './dto/buy-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(SellerRoleInterceptor)
  async create(
    @Body() createProductDto: Prisma.ProductCreateInput,
    @Res() res: Response,
  ) {
    const product = await this.productsService.create(createProductDto);
    return createResponse(
      res,
      HttpStatus.OK,
      'Product created successfully',
      product,
    );
  }

  @Post('buy-product')
  @UseInterceptors(BuyerRoleInterceptor)
  async buyProduct(
    @Body() buyProductDto: BuyProductDto[],
    @Res() res: Response,
    @User('id') userId: string,
  ) {
    const product = await this.productsService.buyProducts(
      buyProductDto,
      userId,
    );
    return createResponse(
      res,
      HttpStatus.OK,
      'Product purchased successfully',
      product,
    );
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  async findAll(
    @Pagination() pagination: PaginationParams,
    @User('role') userRole: Role,
    @User('id') userId: string,
    @Res() res: Response,
  ) {
    const { products, pagination: updatedPagination } =
      await this.productsService.findAll(pagination, userRole, userId);

    return createResponse(
      res,
      HttpStatus.OK,
      'Products fetched successfully',
      products,
      updatedPagination,
    );
  }

  @Get('purchases')
  @UseInterceptors(BuyerRoleInterceptor)
  @UseInterceptors(PaginationInterceptor)
  async findAllUserPurchase(
    @Pagination() pagination: PaginationParams,
    @User('id') userId: string,
    @Res() res: Response,
  ) {
    const { purchases, pagination: updatedPagination } =
      await this.productsService.findAllUserPurchase(pagination, userId);

    return createResponse(
      res,
      HttpStatus.OK,
      'user purchases fetched successfully',
      purchases,
      updatedPagination,
    );
  }

  @Get('purchases/:purchaseId')
  @UseInterceptors(BuyerRoleInterceptor)
  async findUserPurchase(
    @Param('purchaseId') purchaseId: string,
    @User('id') userId: string,
    @Res() res: Response,
  ) {
    const purchase = await this.productsService.findOnePurchase(
      purchaseId,
      userId,
    );

    return createResponse(
      res,
      HttpStatus.OK,
      'user purchase fetched successfully',
      purchase,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @User('role') userRole: Role,
    @User('id') userId: string,
  ) {
    const product = await this.productsService.findOne(id, userRole, userId);
    return createResponse(
      res,
      HttpStatus.OK,
      'Product fetched successfully',
      product,
    );
  }

  @Patch(':id')
  @UseInterceptors(SellerRoleInterceptor)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Prisma.ProductUpdateInput,
    @Res() res: Response,
    @User('id') userId: string,
  ) {
    await this.productsService.update(id, updateProductDto, userId);
    return createResponse(
      res,
      HttpStatus.OK,
      'Product updated successfully',
      null,
    );
  }

  @Delete(':id')
  @UseInterceptors(SellerRoleInterceptor)
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @User('id') userId: string,
  ) {
    await this.productsService.remove(id, userId);
    return createResponse(
      res,
      HttpStatus.OK,
      'Product deleted successfully',
      null,
    );
  }
}
