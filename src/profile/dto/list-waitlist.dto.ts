import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Platform } from '../../utils/constants';

/**
 * Body DTO for `POST /profile/waiting/list`.
 *
 * All fields are optional — sending an empty body `{}` returns the
 * whole waiting list (subject to the default `limit`).
 *
 * Example payloads:
 *   {}                                          → full list
 *   { "email": "someone@example.com" }          → single sign-up lookup
 *   { "userId": "5ffde8dc-..." }                → entries linked to a user
 *   { "platform": 1 }                           → entries from one platform
 *   { "limit": 20, "offset": 20 }               → pagination page 2
 */
export class ListWaitlistDto {
  /**
   * Exact-match filter on waitlist.email.
   */
  @ApiPropertyOptional({
    description: 'Filter by exact email address',
    format: 'email',
    example: 'someone@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Filter by the linked auth user id.
   */
  @ApiPropertyOptional({
    description: 'Filter by waitlist.user_id (UUID)',
    format: 'uuid',
    example: '5ffde8dc-02f0-4fc7-a912-263d7ac80bfa',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  /**
   * Filter by the platform the sign-up came from.
   * Legacy rows have a null platform and never match this filter.
   */
  @ApiPropertyOptional({
    enum: Platform,
    enumName: 'Platform',
    description: 'Filter by waitlist.platform — 1 = web',
    example: Platform.WEB,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Platform)
  platform?: Platform;

  /**
   * Active-status filter. Defaults to `true`, so a caller that says
   * nothing gets only active sign-ups. Pass `false` to inspect
   * deactivated rows.
   */
  @ApiPropertyOptional({
    description:
      'Filter by waitlist.is_active. Defaults to true (active rows only).',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Maximum rows to return',
    default: 100,
    minimum: 1,
    maximum: 200,
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Pagination offset',
    default: 0,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
