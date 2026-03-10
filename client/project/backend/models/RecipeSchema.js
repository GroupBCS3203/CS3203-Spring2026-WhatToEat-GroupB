const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title:{
        type: String
    },
    ingredients: {
        datatype: [String]
    },
    directions:{
        type: [String]
    },
    link:{
        type: String
    },
    NER: {
        datatype: [String]
    }});
RecipeSchema.set('collection', 'recipes');
module.exports = mongoose.model("Recipes", RecipeSchema, 'recipes');