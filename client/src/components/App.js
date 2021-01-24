import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { createPlaylist } from '../logic/createPlaylist';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import PlaylistForm from './PlaylistForm';

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login" component={Login} />
        <Route path="/createplaylist" component={PlaylistForm} />
      </div>
    </BrowserRouter>
  );
}

export default App;
