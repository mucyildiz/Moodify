const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
        done(null, user);
    })
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
        req.session = { token: accessToken };

        const existingUser = await User.findOne({ spotifyId: profile.id });

        if(existingUser){
            return done(null, existingUser);
        }

        const user = await new User({ spotifyId: profile.id }).save();
        done(null, user)
    }
));

