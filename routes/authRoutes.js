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

    app.get(
        '/api/getToken',
        (req, res) => {
            res.send(req.session.token);
        }
    )

    app.get(
        '/done', (req, res) => {
            res.send("Playlist created");
        }
    )

    app.get(
        '/api/getUser', (req, res) => {
            res.send(req.user);
        }
    )
}