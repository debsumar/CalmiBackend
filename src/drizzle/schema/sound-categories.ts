import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';

/**
 * Maps to public.sound_categories.
 * Columns are snake_case in PG; Drizzle exposes them as camelCase TS fields.
 */
export const soundCategories = pgTable('sound_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export type SoundCategory = typeof soundCategories.$inferSelect;
export type NewSoundCategory = typeof soundCategories.$inferInsert;
