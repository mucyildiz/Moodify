import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import './PlaylistForm.css';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { createPlaylist } from '../logic/createPlaylist';

const PlaylistForm = () => {
    const [playlistName, setPlaylistName] = useState('');
    const [mood, setMood] = useState('');
    const [creatingPlaylist, setCreatingPlaylist] = useState(true);
    const [isError, setIsError] = useState(false);

    const handleClick = async () => {
        const user = await axios.get('/api/getUser').catch(err => {throw new Error('No user')});
        const token = await axios.get('/api/getToken').catch(err => {throw new Error('no Token')});



        const id = user.data.id;
        const tokenData = token.data;

        if(playlistName.trim() === "" || mood.length <= 1){
            alert('Playlist Name and Mood must both be filled in. Mood must be a full word.')
            return;
        }
        
        createPlaylist(tokenData, mood, playlistName, id).then(setCreatingPlaylist(!creatingPlaylist)).catch(() => {setIsError(true)});


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
        setCreatingPlaylist(!creatingPlaylist);
        setIsError(false);
    }

    return (
        <div id="page-container">
            <div id="form-container">
            {creatingPlaylist || isError ? 
                <Form id="form">
                    
                        {isError && !creatingPlaylist ? 
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
                        :
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
                        }
                </Form>
                : 
                <>
                    <h1 className="flex-top message" >Playlist added to Spotify account. Enjoy!</h1>
                    <Button id="submit" onClick={handleNewPlaylistClick}>Create New Playlist</Button>
                </>
                }
            </div>
        </div>
    )
}

export default PlaylistForm;