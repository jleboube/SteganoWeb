import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './env.js';
import { upsertGoogleUser } from '../services/authService.js';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: `${env.backendBaseUrl.replace(/\/$/, '')}/api/auth/google/callback`
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertGoogleUser(
            profile.id,
            profile.emails?.[0]?.value ?? `${profile.id}@googleuser.local`,
            {
              given_name: profile.name?.givenName,
              family_name: profile.name?.familyName
            }
          );
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth environment variables missing; Google login disabled.');
}

passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? false);
  } catch (error) {
    done(error as Error);
  }
});

export default passport;
