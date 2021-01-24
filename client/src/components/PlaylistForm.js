import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col'
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
        const user = await axios.get('/api/getUser');
        const token = await axios.get('/api/getToken');

        const id = user.data.id;
        const tokenData = token.data;

        createPlaylist(tokenData, mood, playlistName, id);
    }

    const handleButtonClick = () => {
        setCreatingPlaylist(!creatingPlaylist);
    }

    const updatePlaylistName = (e) => {
        setPlaylistName(e.target.value);
    }

    const updateMood = (e) => {
        setMood(e.target.value)
    }

    return (
        <>
        {creatingPlaylist ? 
        <Form>
            <Row>
                <Form.Control placeholder="Playlist Name" onChange={updatePlaylistName}/>
                <Form.Control placeholder="Mood" onChange={updateMood}/>
                <Button onClick={() => {
                    handleClick();
                    handleButtonClick();
                }}>Yes</Button>
            </Row>
        </Form>
        : <Button onClick={handleButtonClick}>Create New Playlist</Button>}
        </>
    )
}

export default PlaylistForm;