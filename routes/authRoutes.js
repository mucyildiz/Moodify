const passport = require('passport');
const fetch = require('node-fetch');
const keys = require('../config/keys.js')


module.exports = (app) => {

    app.get('/', (req, res) => {
        res.send({hi: 'yeah yeah'});
    })

    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-library-read']
        })
    );

    app.get(
        '/auth/spotify/callback',
        passport.authenticate('spotify'), 
        (req, res) => {
            res.send(req.session)
        }
    );

    app.get(
        '/api/logout', (req, res) => {
            req.session = null;
            req.logout();
            res.redirect('/')
        }
    )
}