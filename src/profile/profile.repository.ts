import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { waitlist, type NewWaitlist, type Waitlist } from '../drizzle/schema';
import type { Platform } from '../utils/constants';

/**
 * Filter options accepted by `findWaitlist`. All optional — pass an
 * empty object (or nothing) to fetch every waitlist row.
 */
export interface FindWaitlistOptions {
  email?: string;
  userId?: string;
  platform?: Platform;
  isActive?: boolean;
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
    // Compared against undefined, not truthiness: platform 0 is a valid code.
    if (opts.platform !== undefined) {
      filters.push(eq(waitlist.platform, opts.platform));
    }
    // Likewise explicit: `false` is a meaningful filter, not "unset".
    if (opts.isActive !== undefined) {
      filters.push(eq(waitlist.isActive, opts.isActive));
    }

    return this.db
      .select()
      .from(waitlist)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(waitlist.createdAt))
      .limit(opts.limit ?? 100)
      .offset(opts.offset ?? 0);
  }

  /**
   * Inserts one waiting-list row and returns it as persisted (so the
   * caller sees DB-generated values like `created_at`).
   *
   * Unique-violation / FK-violation handling is deliberately NOT here —
   * translating driver errors into HTTP semantics is the service's job.
   */
  async insertWaitlist(values: NewWaitlist): Promise<Waitlist> {
    const [row] = await this.db.insert(waitlist).values(values).returning();

    if (!row) {
      // Defensive: `returning()` on a successful insert always yields a
      // row, so this means the driver contract changed under us.
      throw new Error('Insert into waitlist returned no row');
    }

    return row;
  }
}
