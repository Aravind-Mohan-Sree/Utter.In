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
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const googleUrl = profile.photos?.[0].value || '';
      const avatarUrl = googleUrl.replace(/s\d+(-c)?/i, 's400');

      const user = {
        name: profile.displayName || '',
        email: profile.emails?.[0].value || '',
        avatarUrl,
        googleId: profile.id,
      };

      return done(null, user);
    },
  ),
);
