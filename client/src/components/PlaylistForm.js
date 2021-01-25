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

    const handleClick = async () => {
        const user = await axios.get('/api/getUser').catch(err => alert(err));
        const token = await axios.get('/api/getToken').catch(err => alert(err));

        const id = user.data.id;
        const tokenData = token.data;
        if(playlistName.trim() === "" || mood === ""){
            alert('Playlist Name and Mood must both be filled in.')
            return;
        }
        setCreatingPlaylist(!creatingPlaylist);
        createPlaylist(tokenData, mood, playlistName, id);
    }

    const allowed = 'abcdefghijklmnopqrstuvwxyz';
    //want inputs to be one word
    const handleKeyDown = (e) => {
        if(e.key === " " || (!allowed.includes(e.key) && e.key !== 'Backspace')){
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
        setPlaylistName('');
        setMood('');
        setCreatingPlaylist(!creatingPlaylist);
    }

    return (
        <div id="page-container">
            <div id="form-container">
            {creatingPlaylist ? 
                <Form id="form">
                    <h3 id="instruction">Mood must be one word. For best results pick simple moods like 'sad' or 'happy'.</h3>
                    <div className="flex-top">
                        <Row>
                            <Form.Control placeholder="Playlist Name" onChange={updatePlaylistName}/>
                        </Row>
                        <Row>
                            <Form.Control placeholder="Mood" onChange={updateMood} onKeyDown={handleKeyDown}/>
                        </Row>
                    </div>
                        <Row>
                            <Button id="submit" onClick={handleClick}>Create Playlist</Button>
                        </Row>
                </Form>
            : 
            <>
            <h1 className="flex-top message" >Enjoy!</h1>
            <Button id="submit" onClick={handleNewPlaylistClick}>Create New Playlist</Button>
            </>
            }
            </div>
        </div>
    )
}

export default PlaylistForm;