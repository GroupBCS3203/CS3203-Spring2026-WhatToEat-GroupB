const mongoose = require('mongoose');

const Recipe = new mongoose.Schema({
    _id: { type: objectid, required: true },
    title:{
        type: String,
        required: true
    },
    ingredients: {
        datatype: [String],
        required: true
    },
    directions:{
        type: [String],
        required: true
    },
    link:{
        type: String,
        required: true
    },
    NER: {
        datatype: [String],
        required: true
    }});
module.exports = mongoose.model("Recipe", Recipe);