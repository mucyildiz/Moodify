import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import './PlaylistForm.css';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const PlaylistForm = () => {
    const [playlistName, setPlaylistName] = useState('');
    const [mood, setMood] = useState('');
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    const [isError, setIsError] = useState(false);
    const [moodFound, setMoodFound] = useState(true);
    const [playlistCreated, setPlaylistCreated] = useState(false);

    const handleClick = async () => {
        setMoodFound(true);

        if(playlistName.trim() === "" || mood.length <= 1){
            alert('Playlist Name and Mood must both be filled in. Mood must be a full word.')
            return;
        }

        const body = {info: {
            mood: mood,
            name: playlistName
        }};

        try {
            setCreatingPlaylist(true);
            await axios.post('/api/create_playlist', body);
            setCreatingPlaylist(false);
            setPlaylistCreated(true);
        }
        catch(err) {
            const status = err.response.status;
            //invalid mood
            if(status === 400) {
                setMoodFound(false);
            }
            else if(status === 403){
                setIsError(true);
            }
        }

    }

    const allowed = 'abcdefghijklmnopqrstuvwxyz';
    //want inputs to be one word
    const handleKeyDown = (e) => {
        if(e.key === " " || (!allowed.includes(e.key.toLowerCase()) && e.key !== 'Backspace')){
            e.preventDefault();
        }
    };

    const updatePlaylistName = (e) => {
        setPlaylistName(e.target.value);
    }

    const updateMood = (e) => {
        setMood(e.target.value)
    }

    const handleNewPlaylistClick = () => {
        setCreatingPlaylist(false);
        setPlaylistCreated(false);
        setIsError(false);
    }

    const renderLogic = () => {
        if(isError) {
            return (
            <>
                <h3 id="instruction">
                    There was an error somewhere, you might need to login again by pressing the button below.
                </h3>
                <Row>
                    <a href="/auth/spotify">
                        <Button id="submit" >Retry Login</Button>
                    </a>
                </Row>
            </>
            )
        }
        else if(!moodFound) {
            return(
                <>
                <h3 id="instruction">
                    Mood not found, try a different word.
                </h3>
                <div className="flex-top">
                    <Row>
                        <Form.Control placeholder="PLAYLIST NAME" onChange={updatePlaylistName}/>
                    </Row>
                    <Row>
                        <Form.Control placeholder="MOOD" onChange={updateMood} onKeyDown={handleKeyDown}/>
                    </Row>
                </div>
                <Row>
                    <Button id="submit" onClick={handleClick}>Create Playlist</Button>
                </Row>
                </>
            )
        }
        else if(creatingPlaylist) {
            return (
                <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            )
        }
        else if(playlistCreated) {
            return (
                <>
                <h1 className="flex-top message" >Playlist added to Spotify account. Enjoy!</h1>
                <Button id="submit" onClick={handleNewPlaylistClick}>Create New Playlist</Button>
                </>
            )
        }
        return (
            <>
            <h3 id="instruction">
                Mood must be one word. For best results pick simple moods like 'sad' or 'happy'.
            </h3>
            <div className="flex-top">
                <Row>
                    <Form.Control placeholder="PLAYLIST NAME" onChange={updatePlaylistName}/>
                </Row>
                <Row>
                    <Form.Control placeholder="MOOD" onChange={updateMood} onKeyDown={handleKeyDown}/>
                </Row>
            </div>
            <Row>
                <Button id="submit" onClick={handleClick}>Create Playlist</Button>
            </Row>
            </>
        )
    }

    return (
        <div id="page-container">
            <div id="form-container">
            {renderLogic()}
            </div>
        </div>
    )
}

export default PlaylistForm;