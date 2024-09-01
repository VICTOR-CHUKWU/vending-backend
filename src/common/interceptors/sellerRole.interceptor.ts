import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SellerRoleInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user = req.user; // Already validated user

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'Seller') {
      throw new ForbiddenException('You cannot perform this operation');
    }

    return next.handle();
  }
}
