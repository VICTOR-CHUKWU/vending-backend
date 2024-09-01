import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CoinValue } from '../enums';

@ValidatorConstraint({ name: 'isValidCoinValue', async: false })
export class IsValidCoinValueConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    const validValues = Object.values(CoinValue);
    return validValues.includes(value);
  }

  defaultMessage(): string {
    return 'Coin value must be one of the allowed values: 5, 10, 20, 50, 100';
  }
}

export function IsValidCoinValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCoinValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCoinValueConstraint,
    });
  };
}
