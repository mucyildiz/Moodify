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

/* 
Mood score holds valence as high priority, energy as medium priority, danceability as low priority: valence scaled by 1
energy by .75 and dance at .5. They are all rated in [0, 1] for a mood score interval of [0, 2.25]. This interval is then translated
to a integer value between 0 and 3
*/
const convertSentimentScoreToMoodScore = async (phrase) => {
    let moodScore = analyzeSentiment(phrase);
    //-20 is treated the same as -5 so set a limit on the interval that way we can convert it easier
    if(moodScore < -5){
        moodScore = -5;
    }
    if(moodScore > 5){
        moodScore = 5;
    }
    //mapping from [-5, 5] to [0, 2.25] : moodScore - (oldMin) * newMax / oldRange
    moodScore = (((moodScore+5)*2.25) / 10)
    return categorizeMoodOfSong(moodScore);
}

const categorizeMoodOfSong = (moodScore) => {
    const inBetween = (x, min, max) => {
        return x <= max && x >= min;
    }

    if(inBetween(moodScore, 0, .675)){
        return 0;
    }
    if(inBetween(moodScore, .676, 1.125)){
        return 1;
    }
    if(inBetween(moodScore, 1.126, 1.575)){
        return 2;
    }
    else{
        return 3;
    }
}

const getMoodScoreOfSong = (track) => {
    const score = track["valence"] + .5 * track["energy"] + .5 * track["danceability"];
    return categorizeMoodOfSong(score);
}

const getSongsThatFitMoodFromUserLibrary = async (token, phrase) => {
    const moodScore = await convertSentimentScoreToMoodScore(phrase);

    const userTracksIDs = await getUserTracks(token);
    const userTopTracksIDs = await getUserTopTracks(token);
    const userAllTracksIDs = userTracksIDs.concat(userTopTracksIDs);

    const userAllTracksIDsAsString = userAllTracksIDs.toString();

    const tracksAnalysis = await fetch(`https://api.spotify.com/v1/audio-features?ids=${userAllTracksIDsAsString}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8)
        }
    });

    const analyses = await tracksAnalysis.json();
    const songAnalyses = analyses["audio_features"];
    const songsThatFitMood = songAnalyses.filter(track => getMoodScoreOfSong(track) === moodScore);
    const songsThatFitMoodIDs = songsThatFitMood.map(track => track.id);
    return songsThatFitMoodIDs;
    
}

const getUserRecommendations = async (token) => {
    const recResponse = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackIDs[0]+','+trackIDs[1]}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    })
    const recommendations = await recResponse.json();
    console.log(recommendations);
}

module.exports = { getUserTopArtists, getUserTracks, getUserTopTracks, getUserRecommendations, getSongsThatFitMoodFromUserLibrary }