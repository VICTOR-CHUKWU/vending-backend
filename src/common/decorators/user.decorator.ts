import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../enums';

export const User = createParamDecorator(
  (data: keyof UserPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Assuming the JWT strategy populates the user object on the request
    return data ? user?.[data] : user;
  },
);
