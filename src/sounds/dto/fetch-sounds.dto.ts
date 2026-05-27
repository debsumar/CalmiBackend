import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * Body DTO for `POST /sounds/fetch`.
 *
 * All fields are optional — sending an empty body `{}` returns the
 * full catalog (subject to the default `limit`).
 *
 * Example payloads:
 *   {}                                                     → full list
 *   { "categoryId": "5ffde8dc-..." }                       → one category
 *   { "featuredOnly": true }                               → 9 featured rows
 *   { "categoryId": "5ffde8dc-...", "featuredOnly": true } → both filters
 *   { "limit": 20, "offset": 20 }                          → pagination page 2
 */
export class FetchSoundsDto {
  /**
   * Filter by sound_categories.id.
   */
  @ApiPropertyOptional({
    description: 'Filter by sound_categories.id (UUID)',
    format: 'uuid',
    example: '5ffde8dc-02f0-4fc7-a912-263d7ac80bfa',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  /**
   * Restrict to is_featured = true.
   */
  @ApiPropertyOptional({
    description: 'Only return featured sounds',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

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
