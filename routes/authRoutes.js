const passport = require('passport');
const fetch = require('node-fetch');
const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');



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
        async (req, res) => {
            console.log(req.session);
            const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(req.session.token, keys.passphrase).toString(CryptoJS.enc.Utf8),
                }
            })
            const json = await response.json();
            res.send(json);
            
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