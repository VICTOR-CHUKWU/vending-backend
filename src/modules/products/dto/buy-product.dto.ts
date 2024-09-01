import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class BuyProductDto {
  @IsNumber()
  @Min(1, { message: 'Quantity must be greater than zero' })
  @IsNotEmpty({ message: 'Quantity must not be empty' })
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'productId must not be empty' })
  productId: string;
}
