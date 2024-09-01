import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationParams {
  perPage: number;
  currentPage: number;
  totalPages: number;
  totalDocumentCount: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
    }
  }
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const req: Request = ctx.switchToHttp().getRequest();

    let perPage = 10000;
    let currentPage = 1;
    if (req.query.perPage) {
      perPage = parseInt(req.query.perPage as string, 10);
    }

    if (req.query.currentPage) {
      currentPage = parseInt(req.query.currentPage as string, 10);
    }

    return {
      perPage,
      currentPage,
      totalPages: 1,
      totalDocumentCount: 1,
    };
  },
);
