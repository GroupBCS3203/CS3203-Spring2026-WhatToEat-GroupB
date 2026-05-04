const mongoose = require('mongoose');

/*
* This makes the model which user database entries will follow, I feel like it's pretty self-explanatory
* */

const plannedMealSchema = new mongoose.Schema({

});



const DataSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true
    },
    dietFilters: { //dataType = "filters"
        type: [String]
    },
    plannedMeals: [{ //dataType = "plans"
        id: String,
        name: String,
        date: String,
        time: String,
        recipeID: String
    }],
    savedRecipes:{  //dataType = "recipes"
        recipes: [{
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
        type: [[String, Number, Date]]
    },
    shoppingList:{ //dataType = "shoppingList"
        lineItems: [{
            ingredient: String,
            amount: String
        }]
    }
    });
DataSchema.set('collection', 'data');
module.exports = mongoose.model("Data", DataSchema, 'data');