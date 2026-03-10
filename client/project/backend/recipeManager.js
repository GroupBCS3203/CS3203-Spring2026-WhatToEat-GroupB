const recipeModel = require("./models/RecipeSchema.js");
const mongoose = require("mongoose");

async function getOneRecipe()
{
    const corn = await recipeModel.findOne();
    return corn;
}

async function getTopTenRecipes()
{
    let tenRecipes = await recipeModel.aggregate([
        {$match: {NER: { $all: ["onion", "bacon", "salt", "potatoes"] }}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    for(let i = 0; i < 10; i++)
    {
        console.log(tenRecipes[i].title);
        console.log(tenRecipes[i].NER[1]);
    }
}

async function makeIngredientMasterList()
{

    const result = await recipeModel.aggregate([
        { $unwind: "$NER" },                 // break each NER array into individual values
        { $group: { _id: null, allNER: { $addToSet: "$NER" } } }, // collect unique values
        { $project: { _id: 0, allNER: 1 } }
    ]);

    const masterNER = result[0].allNER;

    console.log(masterNER);
    console.log(masterNER.length);
}

async function  findRecipeByIngredient(ingredients)
{
    let array = ingredients.split(", ");
    console.log(array);
    let tenRecipes = await recipeModel.aggregate([
        {$match: {NER: { $all: array }}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    console.log(tenRecipes);
}

module.exports = { getOneRecipe, getTopTenRecipes,makeIngredientMasterList,findRecipeByIngredient };