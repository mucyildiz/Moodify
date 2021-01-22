const Sentiment = require('sentiment');
const fetch = require('node-fetch');
const sentiment = new Sentiment();
const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');

const analyzeSentiment = (phrase) => sentiment.analyze(phrase).score;

const gatherPotentialSongs = async (token) => {
    let potentialSongs = [];
    const response = await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    })
    const tracks = await response.json();
    potentialSongs = tracks['items'].map(obj => obj.track.id);
    console.log(potentialSongs);
}

module.exports = { gatherPotentialSongs }