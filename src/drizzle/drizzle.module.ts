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
