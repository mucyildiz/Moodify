const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const keys = require('../config/keys');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
    new SpotifyStrategy({
        clientID: keys.spotifyClientID,
        clientSecret: keys.spotifyClientSecret,
        callbackURL: "/auth/spotify/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

