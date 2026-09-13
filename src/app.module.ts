import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { SoundsModule } from './sounds/sounds.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Baseline per-IP rate limit for every route. Individual routes tighten
    // this with @Throttle — see the public waiting-list join endpoint.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 60 }],
    }),
    DrizzleModule,
    AuthModule,
    SoundsModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registered globally so a newly added route is rate-limited by
    // default rather than being forgotten.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
