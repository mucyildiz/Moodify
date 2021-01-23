const Sentiment = require('sentiment');
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
Mood considers valence with an interval of [0, 1]. This interval is then translated to a integer value between 0 and 3
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
    //mapping from [-5, 5] to [0, 1] : moodScore - (oldMin) * newMax / oldRange
    moodScore = (moodScore+5) / 10
    return categorizeMoodOfSong(moodScore);
}

const categorizeMoodOfSong = (moodScore) => {
    const inBetween = (x, min, max) => {
        return x <= max && x >= min;
    }

    if(inBetween(moodScore, 0, .35)){
        return 0;
    }
    if(inBetween(moodScore, .36, .6)){
        return 1;
    }
    if(inBetween(moodScore, .61, .8)){
        return 2;
    }
    else{
        return 3;
    }
}

const getMoodScoreOfSong = (track) => {
    const score = track["valence"];
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
    return songsThatFitMood;
}

//https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
const getRandom = (arr, n) => {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

//formatting query so we can get the max of 5 possible seeds to best get recommended tracks
const formatQuery = async (token, phrase) => {
    const songsFromLibThatFitMood = await getSongsThatFitMoodFromUserLibrary(token, phrase);
    const songsFromLibIDs = songsFromLibThatFitMood.map(song => song.id)
    const length = songsFromLibIDs.length;
    if(length >= 5){
        const truncatedSongsArray = getRandom(songsFromLibIDs, 5);
        return `seed_tracks=${truncatedSongsArray.toString()}`;
    }
    const topArtists = await getUserTopArtists(token);
    const numArtists = 5 - length;
    const artists = getRandom(topArtists, numArtists);
    const query = songsFromLibIDs.concat(artists);
    if(length == 0){
        return `seed_artists=${query.toString()}`;
    }
    else{
        return `seed_tracks=${songsFromLibIDs.toString()}&seed_artists=${artists.toString()}`
    }
}

const getUserRecommendations = async (token, phrase) => {
    const query = await formatQuery(token, phrase);
    const recResponse = await fetch(`https://api.spotify.com/v1/recommendations?${query}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    })
    const recommendations = await recResponse.json();
    return recommendations;
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffle = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

const getPlaylistTracks = async (token, phrase) => {
    const recommendationsJSON = await getUserRecommendations(token, phrase);
    const recommendations = recommendationsJSON["tracks"].map(recommendation => recommendation.uri);

    const libSongsJSON = await getSongsThatFitMoodFromUserLibrary(token, phrase);
    const libSongs = libSongsJSON.map(song => song.uri);

    const playlistSongs = recommendations.concat(libSongs);
    const shuffledPlaylistSongs = shuffle(playlistSongs);
    return shuffledPlaylistSongs;
}

const createPlaylist = async (token, phrase, playlistName, user) => {
    const tracks = await getPlaylistTracks(token, phrase);
    if(tracks.length > 100){
        tracks = getRandom(tracks, 100);
    }
    const addPlaylistToUserAcc = await fetch(`https://api.spotify.com/v1/users/${user}/playlists`, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        },
        body: JSON.stringify({
            "name": `${playlistName}`,
        })
    });
    const response = await addPlaylistToUserAcc.json();
    const playlistID = response.id;

    const addTracks = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "uris": tracks,
        })
    })
}



module.exports = { createPlaylist }