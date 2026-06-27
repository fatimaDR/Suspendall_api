import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const  user = req.user.user
    const hasRequiredRole = requiredRoles.some((role) => user.role?.includes(role));
    if (!hasRequiredRole) {
      const response = context.switchToHttp().getResponse();
      response.status(403).json({
        message: 'Forbidden resource',
      });
    }
    return hasRequiredRole;
    // return requiredRoles.some((role) => user.role?.includes(role));
  }
}