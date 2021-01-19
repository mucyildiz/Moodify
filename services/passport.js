const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
        done(null, user);
    });
});

passport.use(
    new SpotifyStrategy({
        clientID: keys.spotifyClientID,
        clientSecret: keys.spotifyClientSecret,
        callbackURL: "/auth/spotify/callback",
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ spotifyId: profile.id });

        if(existingUser){
            return done(null, existingUser);
        }

        const user = await new User({ googleId: profile.id }).save();
        done(null, user)
    }
));

