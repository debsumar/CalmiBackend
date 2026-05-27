import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { sounds, type Sound } from '../drizzle/schema';
import { FetchSoundsDto } from './dto/fetch-sounds.dto';

@Injectable()
export class SoundsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase,
  ) {}

  /**
   * Fetches sounds with optional category and featured filters,
   * ordered featured-first then newest-first.
   */
  async fetchSounds(dto: FetchSoundsDto): Promise<Sound[]> {
    const filters: SQL[] = [];
    if (dto.categoryId) {
      filters.push(eq(sounds.categoryId, dto.categoryId));
    }
    if (dto.featuredOnly) {
      filters.push(eq(sounds.isFeatured, true));
    }

    return this.db
      .select()
      .from(sounds)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(sounds.isFeatured), desc(sounds.createdAt))
      .limit(dto.limit ?? 100)
      .offset(dto.offset ?? 0);
  }
}
