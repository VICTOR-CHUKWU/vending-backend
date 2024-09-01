import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class CustomException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    super(message, statusCode);
    Object.setPrototypeOf(this, CustomException.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
