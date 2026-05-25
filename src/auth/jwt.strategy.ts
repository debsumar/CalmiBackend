import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

/**
 * Verifies Supabase Auth JWTs using the project's public JWKS endpoint.
 *
 * Supabase migrated to asymmetric (ECC P-256 / ES256) signing keys, but
 * keeps the legacy HS256 shared secret published in JWKS as `kty:"oct"`
 * during the rotation window. We accept both algorithms so OAuth tokens
 * (Google sign-in etc.) signed with the new key keep working alongside
 * any older tokens that haven't expired yet.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const projectRef = config.getOrThrow<string>('SUPABASE_PROJECT_REF');
    const issuer = `https://${projectRef}.supabase.co/auth/v1`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${issuer}/.well-known/jwks.json`,
        cache: true,
        cacheMaxAge: 24 * 60 * 60 * 1000, // 24h
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      }),
      algorithms: ['ES256', 'HS256'],
      issuer,
      audience: 'authenticated',
    });
  }

  validate(payload: { sub: string; email?: string; role?: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
