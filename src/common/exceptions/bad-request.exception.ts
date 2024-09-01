import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class BadRequestException extends CustomException {
  statusCode = HttpStatus.BAD_REQUEST;

  constructor(public message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
