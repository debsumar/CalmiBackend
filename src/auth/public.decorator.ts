import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as reachable without a JWT.
 *
 * Controllers keep their class-level `@UseGuards(JwtAuthGuard)` so the
 * default stays fail-closed — a newly added route is protected unless
 * someone deliberately opts it out with this decorator.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
