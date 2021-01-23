const passport = require('passport');



module.exports = (app) => {

    app.get('/', (req, res) => {
        res.send({hi: 'yeah yeah'});
    })

    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-top-read', 'user-library-read', 'playlist-modify-public'],
            showDialog: true
        })
    );

    app.get(
        '/auth/spotify/callback',
        passport.authenticate('spotify'),
        (req, res) => 
        res.redirect('/')
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
        '/api/logout', (req, res) => {
            req.session = null;
            req.logout();
            res.redirect('/')
        }
    )
}