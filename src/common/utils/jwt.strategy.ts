import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        let token = req.headers['authorization'];
        if (token && token.startsWith('Bearer ')) {
          token = token.slice(7, token.length); // Remove "Bearer " prefix
        }
        if (!token) {
          throw new UnauthorizedException('No token provided');
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: 'viky',
    });
  }

  async validate(payload: any) {
    return { email: payload.email, role: payload.role, id: payload.id };
  }
}
