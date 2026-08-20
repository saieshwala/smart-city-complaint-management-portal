import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

/**
 * Role hierarchy: SUPER_ADMIN > AUTHORITY_ADMIN > DEPARTMENT_ADMIN > OFFICER > VIEWER
 * A higher-level role automatically has access to lower-level endpoints.
 */
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  [AdminRole.SUPER_ADMIN]: 5,
  [AdminRole.AUTHORITY_ADMIN]: 4,
  [AdminRole.DEPARTMENT_ADMIN]: 3,
  [AdminRole.OFFICER]: 2,
  [AdminRole.VIEWER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role assigned');
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role as AdminRole];

    if (userRoleLevel === undefined) {
      throw new ForbiddenException('Access denied: unknown role');
    }

    // Check if the user's role level meets or exceeds any of the required roles
    const hasRole = requiredRoles.some((requiredRole) => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole];
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'Access denied: insufficient role privileges',
      );
    }

    return true;
  }
}
