import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/drizzle/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
