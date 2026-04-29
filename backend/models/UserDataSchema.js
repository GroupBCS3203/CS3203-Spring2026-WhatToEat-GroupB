const mongoose = require('mongoose');

/*
* This makes the model which user database entries will follow, I feel like it's pretty self-explanatory
* */

const plannedMealSchema = new mongoose.Schema({

})



const DataSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true
    },
    DietFilters: {
        type: [String]
    },
    plannedMeals: {
        recipeID: String,
        date: Date
    },
    ownedIngredients:{
        type: [String]
    },
    shoppingList:{
        lineItems: [{
            ingredient: String,
            amount: String
        }]
    }

    });
DataSchema.set('collection', 'data');
module.exports = mongoose.model("Data", DataSchema, 'data');