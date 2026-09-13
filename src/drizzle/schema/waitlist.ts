import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { Platform } from '../../utils/constants';

/**
 * Maps to public.waitlist — early-access sign-ups.
 *
 * The flow only ever collects an email, so there is deliberately no
 * `name` column and clients never supply a key: `id` is a generated
 * uuid primary key. `email` keeps a unique constraint and remains the
 * dedup key. `user_id` is a nullable FK to profiles — a visitor joins
 * with an email only and is linked to an auth user later (if ever),
 * server-side.
 * `is_active` defaults to true; `waiting/list` returns only active rows
 * unless a caller explicitly asks for inactive ones.
 */
export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id'),
  platform: integer('platform').$type<Platform>(),
  isActive: boolean('is_active').notNull().default(true),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
