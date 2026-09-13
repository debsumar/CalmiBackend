import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Maps to public.waitlist — early-access sign-ups.
 *
 * `name` and `user_id` are nullable: a visitor can join the waitlist
 * with an email only, and gets linked to an auth user later (if ever).
 * The table has no surrogate primary key, so we mark `email` as the
 * key for Drizzle's benefit — it is the natural unique identifier.
 */
export const waitlist = pgTable('waitlist', {
  name: text('name'),
  email: text('email').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id'),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
