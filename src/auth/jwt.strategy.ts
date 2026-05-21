import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
      issuer: `https://${config.getOrThrow<string>('SUPABASE_PROJECT_REF')}.supabase.co/auth/v1`,
    });
  }

  validate(payload: { sub: string; email?: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
