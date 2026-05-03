const mongoose = require('mongoose');

/*
* This makes the model which user database entries will follow, I feel like it's pretty self-explanatory
* */

const UserSchema = new mongoose.Schema({
    username:{
        type: String
    },
    password: {
        type: String
    }});
UserSchema.set('collection', 'users');
module.exports = mongoose.model("User", UserSchema, 'users');