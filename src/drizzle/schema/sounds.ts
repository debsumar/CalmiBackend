import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { soundCategories } from './sound-categories';

/**
 * Maps to public.sounds. category_id is FK → sound_categories.id (nullable).
 */
export const sounds = pgTable('sounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => soundCategories.id),
  durationSeconds: integer('duration_seconds').notNull().default(2700),
  audioUrl: text('audio_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isFeatured: boolean('is_featured').notNull().default(false),
  isPremium: boolean('is_premium').notNull().default(false),
  playCount: integer('play_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Sound = typeof sounds.$inferSelect;
export type NewSound = typeof sounds.$inferInsert;
