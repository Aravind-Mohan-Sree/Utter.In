import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '~config/env';

passport.use(
  'google-tutor',
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_TUTOR_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        email: profile.emails?.[0].value || '',
      };

      return done(null, user);
    },
  ),
);
