const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const keys = require('../config/keys');

passport.serializeUser((user, done) => {
  done(null, user.spotifyId);
});

passport.deserializeUser((id, done) => {
    done(null, {id: id})
  });

passport.use(
    new SpotifyStrategy({
        clientID: keys.spotifyClientID,
        clientSecret: keys.spotifyClientSecret,
        callbackURL: "/auth/spotify/callback",
        proxy: true,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      req.session.passport.accessToken = accessToken;
      done(null, {spotifyId: profile.id})
    }
));

