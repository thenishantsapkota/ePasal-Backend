import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Users } from '../entities';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: Users = request.user;

    if (!user || !user.is_admin) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
