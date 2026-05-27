import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger response model — mirrors the camelCase shape Drizzle returns
 * from a `select()` against the `sounds` table.
 */
export class SoundEntity {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true, type: String })
  categoryId!: string | null;

  @ApiProperty({ minimum: 0, description: 'Display duration in seconds' })
  durationSeconds!: number;

  @ApiProperty({ format: 'uri' })
  audioUrl!: string;

  @ApiProperty({ format: 'uri', nullable: true, type: String })
  thumbnailUrl!: string | null;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty()
  isPremium!: boolean;

  @ApiProperty({ minimum: 0 })
  playCount!: number;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}
