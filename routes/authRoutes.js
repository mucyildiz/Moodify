const passport = require('passport');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.send({hi: 'yeah yeah'});
    })

    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-top-read']
        })
    );

    app.get(
        '/auth/spotify/callback',
        passport.authenticate('spotify'), 
        (req, res) => {
            res.send(req.user);
        }
    );

    app.get(
        '/api/logout', (req, res) => {
            req.session = null;
            req.logout();
            res.redirect('/api/current_user')
        }
    )

    app.get('/api/current_user', (req, res) => {
        res.send("hi");
    })
}