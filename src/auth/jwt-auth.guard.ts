import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Header format: Authorization: Bearer <token>
    const [type, token] = (req.headers.authorization ?? '').split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    try {
      req.user = await this.jwt.verifyAsync(token); // payload req.user mein rakh diya
      return true;
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }
}