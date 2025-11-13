const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['farmer', 'company'], 
        required: true 
    },
    // Optional data to enrich the user profile
    profile: {
        companyName: String,
        farmAcres: Number,
        location: String
    }
});

module.exports = mongoose.model('User', UserSchema);