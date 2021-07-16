const express = require('express');
const keys = require('./config/keys');
const passport = require('passport');
const cookieSession = require('cookie-session');
const session = require('express-session');
require('./services/passport');

const app = express();

app.use(cookieSession({
    name: 'session',
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days in ms
    keys: [keys.cookieKey, keys.cookieKeyTwo]
}))

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/userRoutes')(app);
require('./routes/spotifyRoutes')(app);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))

    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT)