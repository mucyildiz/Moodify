const Sentiment = require('sentiment');
const fetch = require('node-fetch');
const sentiment = new Sentiment();
const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');

const analyzeSentiment = (phrase) => sentiment.analyze(phrase).score;

const getResponse = async (url, token) => {
    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    })
    const json = await response.json();
    return json;
}

const getUserTracks = async (token) => {
    const tracks = await getResponse('https://api.spotify.com/v1/me/tracks?limit=50', token);
    const userTracksIDs = tracks['items'].map(obj => obj.track.id);
    return userTracksIDs;
}

const getUserTopArtists = async (token) => {
    const topArtists = await getResponse('https://api.spotify.com/v1/me/top/artists', token);
    const topArtistsIDs = topArtists['items'].map(obj => obj.id);
    return topArtistsIDs
}

const getUserTopTracks = async (token) => {
    const topUserTracks = await getResponse('https://api.spotify.com/v1/me/top/tracks?limit=50', token);
    const topUserTracksIDs = topUserTracks['items'].map(obj => obj.id);
    return topUserTracksIDs;
}

const getUserRecommendations = async (token) => {
    let trackIDs = await getUserTopTracks(token);
    trackIDs = trackIDs.slice(0, 5);
    const recResponse = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackIDs[0]+','+trackIDs[1]}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    })
    const recommendations = await recResponse.json();
    console.log(recommendations);
}

module.exports = { getUserTopArtists, getUserTracks, getUserTopTracks, getUserRecommendations }