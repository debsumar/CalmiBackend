import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * Query DTO for `GET /sounds`.
 * All fields are optional — calling the endpoint with no params returns
 * the full list (capped at `limit`).
 */
export class FetchSoundsDto {
  /**
   * Filter by sound_categories.id. Pass the UUID returned from the
   * categories endpoint or seeded sound_categories table.
   */
  @ApiPropertyOptional({
    description: 'Filter sounds by sound_categories.id',
    format: 'uuid',
    example: '5ffde8dc-02f0-4fc7-a912-263d7ac80bfa',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  /**
   * Restrict results to is_featured = true. Accepts the strings
   * 'true' / 'false' on the query string.
   */
  @ApiPropertyOptional({
    description: 'Only return featured sounds',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum rows to return',
    default: 100,
    minimum: 1,
    maximum: 200,
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
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
