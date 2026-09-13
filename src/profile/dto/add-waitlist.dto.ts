import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Platform } from '../../utils/constants';

/**
 * Body DTO for `POST /profile/waiting/add` (public, no auth).
 *
 * Deliberately email + platform only:
 *   - `id` is a server-generated uuid, never supplied by a client.
 *   - `user_id` is a FK to profiles that only the server can trust; an
 *     anonymous visitor has no way to know it, and accepting it from the
 *     body would let anyone attach their sign-up to another user's
 *     profile. Linking happens server-side later.
 */
export class AddWaitlistDto {
  @ApiProperty({
    format: 'email',
    example: 'someone@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    enum: Platform,
    enumName: 'Platform',
    description: 'Client platform code — 1 = web, 2 = android, 3 = ios',
    example: Platform.WEB,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Platform)
  platform?: Platform;
}
