import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '~config/env';

passport.use(
  'google-user',
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_USER_CALLBACK_URL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        name: profile.displayName || '',
        email: profile.emails?.[0].value || '',
        avatar: profile.photos?.[0].value || '',
        googleId: profile.id,
      };

      return done(null, user);
    },
  ),
);
