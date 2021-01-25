const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const intervals = require('./trackStatIntervals.js');

const sadIntervals = intervals.trackStatisticIntervals.sad;
const calmIntervals = intervals.trackStatisticIntervals.calm;
const happyIntervals = intervals.trackStatisticIntervals.happy;
const energeticIntervals = intervals.trackStatisticIntervals.energetic;
const angryIntervals = intervals.trackStatisticIntervals.angry;

const fetchSynonyms = async (word) => {
    const res = await fetch(`https://dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${keys.thesaurus}`).catch(err => alert(err));
    const json = await res.json().catch(err => alert(err));
    let synonyms = [];
    try{
        synonyms = json[0].meta.syns;
    }
    catch(err) {
        return -1;
    }
    return synonyms;
}

const findMood = async (word) => {
    const moods = ['sad', 'calm', 'energetic', 'happy', 'angry'];
    if(moods.includes(word)){
        return moods.indexOf(word);
    }
    // we make secondary array in case first one doesn't find any matches - will slow down and make more api calls but itll be more accurate
    let moreSynonyms = [];
    const synonyms = await fetchSynonyms(word).catch(err => alert(err));
    if(synonyms === -1){
        return -1;
    }
    for(let synonymArray of synonyms){
        // max 10 synonyms per array to limit number of api calls, 10 should be more than enough anyway
        let numSynonyms = 0;
        for(let synonym of synonymArray){
            if(moods.includes(synonym)){
                return moods.indexOf(synonym);
            }
            if(numSynonyms < 10){
                moreSynonyms.push(synonym);
                numSynonyms++;
            }
        }
    }
    for(let synonym of moreSynonyms){
        const secondarySynonymArrays = await fetchSynonyms(synonym).catch(err => alert(err));
        for(let secondarySynonymArray of secondarySynonymArrays){
            for(let secondarySynonym of secondarySynonymArray){
                if(moods.includes(secondarySynonym)){
                    return moods.indexOf(secondarySynonym);
                }
            }
        }
    }
    return -1;
}


const getResponse = async (url, token) => {
    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    }).catch(err => alert(err));
    const json = await response.json().catch(err => alert(err));
    return json;
}

const getUserTracks = async (token) => {
    const tracks = await getResponse('https://api.spotify.com/v1/me/tracks?limit=50', token).catch(err => alert(err));
    const userTracksIDs = tracks['items'].map(obj => obj.track.id);
    return userTracksIDs;
}

const getUserTopArtists = async (token) => {
    const topArtists = await getResponse('https://api.spotify.com/v1/me/top/artists', token).catch(err => alert(err));
    const topArtistsIDs = topArtists['items'].map(obj => obj.id);
    return topArtistsIDs
}

const getUserTopTracks = async (token) => {
    const topUserTracks = await getResponse('https://api.spotify.com/v1/me/top/tracks?limit=50', token).catch(err => alert(err));
    const topUserTracksIDs = topUserTracks['items'].map(obj => obj.id);
    return topUserTracksIDs;
}

const returnMoodObject = (mood) => {
    switch(mood){
        case 'sad':
            return sadIntervals;
        case 'calm':
            return calmIntervals;
        case 'happy':
            return happyIntervals;
        case 'energetic':
            return energeticIntervals;
        case 'angry':
            return angryIntervals;
        default:
            return false;
    }
}

const categorizeMoodOfSong = (dance, energy, tempo, valence) => {
    const inBetween = (x, min, max) => {
        return x <= max && x >= min;
    }

    const inspectTrack = (passedInMood) => {
        const mood = returnMoodObject(passedInMood);
        if(mood === false){
            return false;
        }
        return inBetween(dance, mood.dance.low, mood.dance.high) && 
        inBetween(energy, mood.energy.low, mood.energy.high) && 
        inBetween(tempo, mood.tempo.low, mood.tempo.high) && 
        inBetween(valence, mood.valence.low, mood.valence.high); 
    }



    const isSad = inspectTrack('sad')
    const isCalm = inspectTrack('calm')
    const isHappy = inspectTrack('happy');
    const isEnergetic = inspectTrack('energetic');
    const isAngry = inspectTrack('angry');

    //IMPORTANT: isSad should come before isCalm because calm can be sad but sad isnt calm
    //these numbers have to correspond to their index in moods in findMood()
    if(isSad){
        return 0;
    }
    if(isCalm){
        return 1;
    }
    if(isEnergetic){
        return 2;
    }
    if(isHappy){
        return 3;
    }
    if(isAngry){
        return 4;
    }
    return -1;
}

const getMoodScoreOfSong = (track) => {
    const dance = track["danceability"];
    const energy = track["energy"];
    const tempo = track["tempo"];
    const valence = track["valence"];
    return categorizeMoodOfSong(dance, energy, tempo, valence);
}

const getSongsThatFitMoodFromUserLibrary = async (token, phrase) => {
    const moodScore = await findMood(phrase).catch(err => alert(err));

    const userTracksIDs = await getUserTracks(token).catch(err => alert(err));
    const userTopTracksIDs = await getUserTopTracks(token).catch(err => alert(err));
    const userAllTracksIDs = userTracksIDs.concat(userTopTracksIDs);

    const userAllTracksIDsAsString = userAllTracksIDs.toString();

    const tracksAnalysis = await fetch(`https://api.spotify.com/v1/audio-features?ids=${userAllTracksIDsAsString}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8)
        }
    }).catch(err => alert(err));

    const analyses = await tracksAnalysis.json().catch(err => alert(err));
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
    const moods = ['sad', 'calm', 'energetic', 'happy', 'angry'];
    let URLquery = '';
    const moodScore = await findMood(phrase).catch(err => alert(err));
    
    const songsFromLibThatFitMood = await getSongsThatFitMoodFromUserLibrary(token, phrase).catch(err => alert(err));
    const songsFromLibIDs = songsFromLibThatFitMood.map(song => song.id)
    const length = songsFromLibIDs.length;
    if(length >= 5){
        const truncatedSongsArray = getRandom(songsFromLibIDs, 5);
        return `seed_tracks=${truncatedSongsArray.toString()}`;
    }
    const topArtists = await getUserTopArtists(token).catch(err => alert(err));
    const numArtists = 5 - length;
    const artists = getRandom(topArtists, numArtists);
    const query = songsFromLibIDs.concat(artists);
    if(length === 0){
        URLquery = `seed_artists=${query.toString()}`;
    }
    else{
        URLquery = `seed_tracks=${songsFromLibIDs.toString()}&seed_artists=${artists.toString()}`
    }
    let mood = returnMoodObject(moods[moodScore]);
    if(mood === false){
        return URLquery;
    }
    const additionalQuery = `&min_danceability=${mood.dance.low}&max_danceability=${mood.dance.high}
    &min_energy=${mood.energy.low}&max_energy=${mood.energy.high}&min_tempo=${mood.tempo.low}&max_tempo=${mood.tempo.high}
    &min_valence=${mood.valence.low}&max_valence=${mood.valence.high}`;

    return URLquery.concat(additionalQuery);
}

const getUserRecommendations = async (token, phrase) => {

    const query = await formatQuery(token, phrase).catch(err => alert(err));
    const recResponse = await fetch(`https://api.spotify.com/v1/recommendations?${query}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    }).catch(err => alert(err));
    const recommendations = await recResponse.json().catch(err => alert(err));
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
    const recommendationsJSON = await getUserRecommendations(token, phrase).catch(err => alert(err));
    const recommendations = recommendationsJSON["tracks"].map(recommendation => recommendation.uri);

    const libSongsJSON = await getSongsThatFitMoodFromUserLibrary(token, phrase).catch(err => alert(err));
    const libSongs = libSongsJSON.map(song => song.uri);

    const playlistSongs = recommendations.concat(libSongs);
    const shuffledPlaylistSongs = shuffle(playlistSongs);
    const shuffledPlaylistSongsWithoutDuplicates = shuffledPlaylistSongs.filter((item, pos, self) => {
        return self.indexOf(item) === pos;
    })
    return shuffledPlaylistSongsWithoutDuplicates;
}

export const createPlaylist = async (token, phrase, playlistName, user) => {
    let tracks = await getPlaylistTracks(token, phrase).catch(err => alert(err));
    //we dont want playlists to be too too long, this really only happens when a mood isnt recognized so all songs are fair play
    if(tracks.length > 30){
        tracks = getRandom(tracks, 30);
    }
    const addPlaylistToUserAcc = await fetch(`https://api.spotify.com/v1/users/${user}/playlists`, {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        },
        body: JSON.stringify({
            "name": `${playlistName}`,
        })
    }).catch(err => alert(err));
    const response = await addPlaylistToUserAcc.json().catch(err => alert(err));
    const playlistID = response.id;

    fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
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