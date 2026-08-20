import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator that specifies which admin roles are allowed to access the endpoint.
 * Uses the Prisma AdminRole enum for consistency with the database schema.
 *
 * Role hierarchy: SUPER_ADMIN > AUTHORITY_ADMIN > DEPARTMENT_ADMIN > OFFICER > VIEWER
 *
 * @example
 * @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUTHORITY_ADMIN)
 * @Get('dashboard')
 * getDashboard() { ... }
 */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
