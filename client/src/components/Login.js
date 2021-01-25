import React from 'react';
import Button from 'react-bootstrap/Button';
import './Login.css';

const Login = (props) => {
    return(
        <div id="login-page-container">
            <div id="login-button-container">
                <a href='/auth/spotify'>
                    <Button id="btn" size="lg"   >
                        Login with Spotify
                    </Button>
                </a>
            </div>
        </div>
        )
}

export default Login;