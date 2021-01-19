const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    spotifyId: String,
    accessToken: String,
    refreshToken: String
});

mongoose.model('users', userSchema);