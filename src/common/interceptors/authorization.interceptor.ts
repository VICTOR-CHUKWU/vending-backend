import {
  Injectable,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class AuthorizationInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // This should be the authenticated user
    // Extract the user ID from the route parameters
    const id = request.params.id;

    // If ID is present, check if the current user is trying to access or modify their own data
    if (id && id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to access or modify this resource',
      );
    }

    // Continue to the next handler if authorization passes
    return next.handle();
  }
}
