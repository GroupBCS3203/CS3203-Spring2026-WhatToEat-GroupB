const mongoose = require('mongoose');

/*
* This makes the model which user database entries will follow, I feel like it's pretty self-explanatory
* */

const DataSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true
    },
    DietFilters: { //dataType = "filters"
        type: [String]
    },
    plannedMeals: { //dataType = "plans"
        recipeID: String,
        date: Date
    },
    savedRecipes:{  //dataType = "recipes"
        recipe: [{
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
            }
        }]
    },
    ownedIngredients:{ //dataType = "ingredients"
        lineItems: [{
            ingredientName: String, 
            amount: Number,
            experation: Date
        }]
    },
    shoppingList:{ //dataType = "shoppingList"
        lineItems: [{
            ingredient: String,
            amount: String
        }]
    },
    dataType: {
        type: String,
    }


    });
DataSchema.set('collection', 'data');
module.exports = mongoose.model("Data", DataSchema, 'data');