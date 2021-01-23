const passport = require('passport');
const fetch = require('node-fetch');
const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');
const { getPlaylistTracks, createPlaylist } = require('../logic/createPlaylist.js');



module.exports = (app) => {

    app.get('/', (req, res) => {
        res.send({hi: 'yeah yeah'});
    })

    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-top-read', 'user-library-read', 'playlist-modify-public']
        })
    );

    app.get(
        '/auth/spotify/callback',
        passport.authenticate('spotify'),
        (req, res) => 
        res.redirect('/')
    );

    app.get(
        '/api/createplaylist',
        async (req, res) => {
            createPlaylist(req.session.token, 'happy', 'testing code pls work', req.user.spotifyId);
            res.redirect('/done');
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