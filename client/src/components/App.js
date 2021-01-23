import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import axios from 'axios';
import { createPlaylist } from '../logic/createPlaylist';
import Login from './Login';
import React, { useState } from 'react';

const App = () => {
  const [token, setToken] = useState('');

  if(!token){
    return (
      <Login setToken={setToken}/>
    )
  }

  return (
    <BrowserRouter>
      <div>
        <button>est token</button>
      </div>
    </BrowserRouter>
  );
}

export default App;
