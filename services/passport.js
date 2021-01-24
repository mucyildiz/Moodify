const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const keys = require('../config/keys');
const CryptoJS = require('crypto-js');


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
        req.session.token = CryptoJS.AES.encrypt(accessToken, keys.passphrase).toString();
        done(null, {spotifyId: profile.id})
    }
));

