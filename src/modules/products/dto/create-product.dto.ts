import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @IsNotEmpty()
  @IsNumber()
  amountRemaining: number;

  @IsArray()
  @IsOptional()
  productImages?: string[];

  @IsNotEmpty()
  @IsUUID() // Assuming sellerId is a UUID based on the Prisma model
  sellerId: string;
}
