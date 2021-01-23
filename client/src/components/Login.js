import React from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const Login = (props) => {

    const handleClick = async () => {
        const token = await axios.get('/api/getToken');
        console.log(token.data);
        props.setToken(token.data);
    }

    return(
        <div>
            <Button href='/auth/spotify'>
                Login with Spotify
            </Button>
        </div>
        )
}

export default Login;