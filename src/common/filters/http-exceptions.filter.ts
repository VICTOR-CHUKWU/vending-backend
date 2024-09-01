import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';
import { CustomException } from '../exceptions/custom.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (response.headersSent) {
      // If headers are already sent, don't attempt to send another response
      return;
    }

    let errorResponse;

    if (exception instanceof CustomException) {
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        errors: exception.serializeErrors(),
      };
    } else if (
      exception instanceof HttpException &&
      status === HttpStatus.BAD_REQUEST
    ) {
      const exceptionResponse = exception.getResponse() as any;

      // Handle validation error response structure
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Validation failed',
        errors: this.formatValidationErrors(exceptionResponse.message),
      };
    } else {
      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exception.message || 'Internal server error',
      };
    }

    response.status(status).json(errorResponse);
  }

  // Helper method to format validation errors
  private formatValidationErrors(errors: ValidationError[] | string[]): any {
    if (Array.isArray(errors) && typeof errors[0] === 'object') {
      return errors.map((err) => ({
        property: err.property,
        constraints: err.constraints,
      }));
    }
    return errors;
  }
}
