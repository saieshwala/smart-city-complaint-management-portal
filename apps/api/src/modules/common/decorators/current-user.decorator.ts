import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom parameter decorator that extracts the current authenticated user
 * from the request object.
 *
 * The user object is attached to the request by Passport after successful
 * JWT validation.
 *
 * @example
 * // Get the full user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserPayload) { ... }
 *
 * @example
 * // Get a specific field from the user
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? (user as Record<string, unknown>)[data] : user;
  },
);
