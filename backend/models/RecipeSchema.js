const mongoose = require('mongoose');

/*
* This makes the model which a recipe entry will follow, I feel like it's pretty self-explanatory
* */

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