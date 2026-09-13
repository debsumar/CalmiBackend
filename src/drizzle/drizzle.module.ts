import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');

        // Fail fast on an unsubstituted connection string. Note that a real
        // environment variable takes precedence over .env, so a stale
        // `export DATABASE_URL=...` in the shell will silently win — that
        // produces a per-request 500 (28P01) instead of an obvious startup
        // error, which is exactly what this guard turns into a loud failure.
        const password = (() => {
          try {
            return decodeURIComponent(new URL(url).password);
          } catch {
            throw new Error('DATABASE_URL is not a valid connection URL.');
          }
        })();

        if (/[[\]]|YOUR[-_]?DB|YOUR[-_]?PASSWORD/i.test(password)) {
          throw new Error(
            'DATABASE_URL still contains a placeholder password. ' +
              'Check for a stale `DATABASE_URL` exported in your shell — a real ' +
              'env var overrides .env. Run `env | grep DATABASE_URL`, then ' +
              '`unset DATABASE_URL` before starting.',
          );
        }

        // Supabase transaction pooler (port 6543) does NOT support prepared statements.
        // We always disable them so the same code works against pooler & direct connection.
        const client = postgres(url, {
          prepare: false,
          // Keep the per-Lambda pool tiny so we don't exhaust Supabase pooler connections.
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        });
        return drizzle(client);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
