import React from 'react';
import Button from 'react-bootstrap/Button';

const Login = (props) => {
    return(
        <div>
            <Button href='/auth/spotify'>
                Login with Spotify
            </Button>
        </div>
        )
}

export default Login;