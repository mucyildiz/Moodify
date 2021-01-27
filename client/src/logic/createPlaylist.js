const keys = require('../config/keys.js');
const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const intervals = require('./trackStatIntervals.js');

const sadIntervals = intervals.trackStatisticIntervals.sad;
const calmIntervals = intervals.trackStatisticIntervals.calm;
const happyIntervals = intervals.trackStatisticIntervals.happy;
const energeticIntervals = intervals.trackStatisticIntervals.energetic;
const angryIntervals = intervals.trackStatisticIntervals.angry;
const loveIntervals = intervals.trackStatisticIntervals.love;

const moods = ['sad', 'calm', 'energ', 'happy', 'angry', 'love']

const fetchSynonyms = async (word) => {
    const res = await fetch(`https://dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${keys.thesaurus}`);
    const json = await res.json().catch(err => {throw new Error('could not fetch from thesaurus')});
    let synonyms = [];
    try{
        synonyms = json[0].meta.syns;
    }
    catch(err) {
        return -1;
    }
    return synonyms;
}

export const findMood = async (word, tracker) => {
    let foundMood ='';
    if(tracker === 4){
        return -1;
    }
    //edge cases that thesaurus cant match
    if(word.includes('excite')){
        word = 'energ';
    };
    if(word.includes('moody')){
        word = 'sad';
    }
    if(word.includes('chill')){
        word = 'calm';
    }
    if(word.includes('hype')){
        word='energ';
    }

    word = word.toLowerCase();
    const isMatch = (word) => {
        for(let mood of moods){
            if(word.includes(mood)){
                foundMood = mood;
            }
        }
    }
    isMatch(word);
    if(foundMood){
        return moods.indexOf(foundMood);
    }
    const synonyms = await fetchSynonyms(word);
    console.log(synonyms);
    if(synonyms === -1){
        return -1;
    }
    let moreSynonyms = [];
    for(let synonymArray of synonyms){
        // max 10 synonyms per array to limit number of api calls, 10 should be more than enough anyway
        let numSynonyms = 0;
        for(let synonym of synonymArray){
            isMatch(synonym);
            if(foundMood){
                return moods.indexOf(foundMood);
            }
            if(numSynonyms < 10){
                moreSynonyms.push(synonym);
                numSynonyms++;
            }
        }
    }
    for(let synonym of moreSynonyms){
        return findMood(synonym, tracker+1);
    }
}

const getResponse = async (url, token) => {
    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    }).catch(err => {throw new Error('couldnt fetch')});
    const json = await response.json().catch(err => {throw new Error('could not fetch response')});
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
    // if theres no top artists then we go in to their liked songs and just get artists from there
    if(topArtistsIDs.length === 0){
        const tracks = await getResponse('https://api.spotify.com/v1/me/tracks?limit=20', token);
        const artists = (tracks['items']).map(obj => obj.track.artists[0].id);
            // if user has no saved tracks, then we go to the global top 50 playlist and get artists from there
            if(artists.length === 0){
                const topTracksArtists = await getResponse('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF', token);
                const topTracksArtistsIDs = topTracksArtists.tracks.items.map(obj => obj.track.artists[0].id);
                return topTracksArtistsIDs;
            }
        return artists;
    }
    return topArtistsIDs
}

const getUserTopTracks = async (token) => {
    const topUserTracks = await getResponse('https://api.spotify.com/v1/me/top/tracks?limit=50', token);
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
        case 'energ':
            return energeticIntervals;
        case 'angry':
            return angryIntervals;
        case 'love':
            return loveIntervals;
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
    const isEnergetic = inspectTrack('energ');
    const isAngry = inspectTrack('angry');
    const isLove = inspectTrack('love');

    //IMPORTANT: isSad should come before isCalm because calm can be sad but not vice versa
    if(isSad){
        return moods.indexOf('sad');
    }
    if(isCalm){
        return moods.indexOf('calm');
    }
    if(isEnergetic){
        return moods.indexOf('energ');
    }
    if(isHappy){
        return moods.indexOf('happy');
    }
    if(isAngry){
        return moods.indexOf('angry');
    }
    if(isLove){
        return moods.indexOf('love');
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
    const moodScore = await findMood(phrase, 0);

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

    const analyses = await tracksAnalysis.json().catch(err => {throw new Error('could not analyze tracks')});
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
        return arr;
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

//formatting query so we can get the max of 5 possible seeds to best get recommended tracks
const formatQuery = async (token, phrase, tryAgain=false) => {
    let URLquery = '';
    const moodScore = await findMood(phrase, 0);
    
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
    let additionalQuery = `&min_danceability=${mood.dance.low}&max_danceability=${mood.dance.high}
    &min_energy=${mood.energy.low}&max_energy=${mood.energy.high}&min_tempo=${mood.tempo.low}&max_tempo=${mood.tempo.high}
    &min_valence=${mood.valence.low}&max_valence=${mood.valence.high}`;

    // if recommendations is empty we go again with just energy and valence, i think thats the best backup measurement
    if(tryAgain === true){
        additionalQuery = `&min_energy=${mood.energy.low}&max_energy=${mood.energy.high}&min_valence=${mood.valence.low}&max_valence=${mood.valence.high}`;
    }

    return URLquery.concat(additionalQuery);
}

const getUserRecommendations = async (token, phrase) => {

    const query = await formatQuery(token, phrase).catch(err => {throw new Error('could not query')});
    const recResponse = await fetch(`https://api.spotify.com/v1/recommendations?${query}`, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
        }
    });
    const recommendations = await recResponse.json().catch(err => {throw new Error('could not get recommendations')});
    const checkLength = recommendations["tracks"].length;
    if(checkLength < 8){
        const newQuery = await formatQuery(token, phrase, true);
        const newResponse = await fetch(`https://api.spotify.com/v1/recommendations?${newQuery}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + CryptoJS.AES.decrypt(token, keys.passphrase).toString(CryptoJS.enc.Utf8),
            }
        });
        const newRecs = await newResponse.json();
        return newRecs;
    }
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
    const recommendationsJSON = await getUserRecommendations(token, phrase)
    const recommendations = recommendationsJSON["tracks"].map(recommendation => recommendation.uri);

    const libSongsJSON = await getSongsThatFitMoodFromUserLibrary(token, phrase);
    const libSongs = libSongsJSON.map(song => song.uri);

    const playlistSongs = recommendations.concat(libSongs);
    const shuffledPlaylistSongs = shuffle(playlistSongs);
    const shuffledPlaylistSongsWithoutDuplicates = shuffledPlaylistSongs.filter((item, pos, self) => {
        return self.indexOf(item) === pos;
    })
    return shuffledPlaylistSongsWithoutDuplicates;
}

export const createPlaylist = async (token, phrase, playlistName, user) => {
    let tracks = await getPlaylistTracks(token, phrase);
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
    });
    const response = await addPlaylistToUserAcc.json().catch(err => {throw new Error('could not initialize playlist')});
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
    }).catch((err) => {
        throw new Error('could not post tracks');
    });
}