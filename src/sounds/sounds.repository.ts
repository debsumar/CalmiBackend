import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { sounds, type Sound } from '../drizzle/schema';

/**
 * Filter options accepted by `findAll`. All optional — pass an empty
 * object (or nothing) to fetch every sound row.
 */
export interface FindSoundsOptions {
  categoryId?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Data-access layer for `public.sounds`.
 *
 * Pure persistence — no business rules, no DTOs, no HTTP concerns.
 * The service layer should be the only caller. Adding new query
 * shapes (e.g. `findById`, `incrementPlayCount`) belongs here.
 */
@Injectable()
export class SoundsRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase,
  ) {}

  /**
   * Returns sounds matching the given filters, ordered featured-first
   * then newest-first. `limit` is capped by the DTO at the controller
   * boundary; if the caller passes nothing we default to 100.
   */
  async findAll(opts: FindSoundsOptions = {}): Promise<Sound[]> {
    const filters: SQL[] = [];

    if (opts.categoryId) {
      filters.push(eq(sounds.categoryId, opts.categoryId));
    }
    if (opts.featuredOnly) {
      filters.push(eq(sounds.isFeatured, true));
    }

    return this.db
      .select()
      .from(sounds)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(sounds.isFeatured), desc(sounds.createdAt))
      .limit(opts.limit ?? 100)
      .offset(opts.offset ?? 0);
  }
}
