import './App.css';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { createPlaylist } from '../logic/createPlaylist';
import Login from './Login';
import React, { useState } from 'react';

const App = () => {
  const [token, setToken] = useState('');

          

  return (
    <BrowserRouter>
      <div>
        <Route exact path='/'>
          {token ? <button>est token</button> : <Redirect to='/login' />}
        </Route>
        <Route exact path="/login" render={() => <Login setToken={setToken}/>} />
        
      </div>
    </BrowserRouter>
  );
}

export default App;
