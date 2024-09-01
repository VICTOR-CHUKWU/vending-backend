import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role, CoinValue } from '../../../common/enums';
import { IsValidCoinValue } from 'src/common/utils';

export class UserDto {
  @IsString()
  @IsNotEmpty({ message: 'ID must not be empty' })
  id: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name must not be empty' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name must not be empty' })
  lastName: string;

  @IsString()
  picture: string;

  @IsEnum(Role, { message: 'Role must be either Buyer or Seller' })
  @IsNotEmpty({ message: 'Role must not be empty' })
  role: Role;
}

export class TokenDto {
  @IsValidCoinValue({ message: 'Invalid coin value' })
  @IsNotEmpty({ message: 'Coin value must not be empty' })
  coinValue: CoinValue;
}
