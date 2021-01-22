const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./models/User');
require('./services/passport');

mongoose.connect(keys.mongoURI, { useUnifiedTopology: true, useNewUrlParser: true });

const app = express();

app.use(cookieSession({
    name: 'session',
    keys: [keys.cookieKey, keys.cookieKeyTwo]
}))

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT)