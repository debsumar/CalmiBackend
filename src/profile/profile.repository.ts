import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { waitlist, type Waitlist } from '../drizzle/schema';

/**
 * Filter options accepted by `findWaitlist`. All optional — pass an
 * empty object (or nothing) to fetch every waitlist row.
 */
export interface FindWaitlistOptions {
  email?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Data-access layer for `public.waitlist`.
 *
 * Pure persistence — no business rules, no DTOs, no HTTP concerns.
 * The service layer should be the only caller. New query shapes
 * (e.g. `countPending`, `linkUser`) belong here.
 */
@Injectable()
export class ProfileRepository {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase) {}

  /**
   * Returns waitlist entries matching the given filters, newest-first.
   * `limit` is capped by the DTO at the controller boundary; if the
   * caller passes nothing we default to 100.
   */
  async findWaitlist(opts: FindWaitlistOptions = {}): Promise<Waitlist[]> {
    const filters: SQL[] = [];

    if (opts.email) {
      filters.push(
        sql`lower(${waitlist.email}) = ${opts.email.toLowerCase()}`,
      );
    }
    if (opts.userId) {
      filters.push(eq(waitlist.userId, opts.userId));
    }

    return this.db
      .select()
      .from(waitlist)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(waitlist.createdAt))
      .limit(opts.limit ?? 100)
      .offset(opts.offset ?? 0);
  }
}
