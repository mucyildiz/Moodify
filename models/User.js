const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    spotifyId: String,
});

mongoose.model('users', userSchema);