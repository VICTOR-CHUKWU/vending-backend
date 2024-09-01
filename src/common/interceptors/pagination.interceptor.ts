import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { PaginationParams } from '../decorators/pagination.decorator';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const pagination: PaginationParams = req.pagination;

    return next.handle().pipe(
      map((data) => {
        // Assuming data is an array of items
        const totalDocumentCount = data.length;
        const totalPages = Math.ceil(totalDocumentCount / pagination.perPage);

        req.pagination.totalDocumentCount = totalDocumentCount;
        req.pagination.totalPages = totalPages;

        return {
          data,
          pagination: req.pagination,
        };
      }),
    );
  }
}
