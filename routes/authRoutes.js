const passport = require('passport');

module.exports = (app) => {

    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-top-read', 'user-library-read', 'playlist-modify-public'],
            showDialog: true
        })
    );

    app.get(
        '/auth/spotify/callback',
        passport.authenticate('spotify', {
            successRedirect: process.env.NODE_ENV === 'production' ? '/createPlaylist' : 'http://localhost:3000/createPlaylist',
            failureRedirect: process.env.NODE_ENV === 'production' ? "/login" : "http://localhost:3000/login"
        }),
    );
    
}