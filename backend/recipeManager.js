const recipeModel = require("./models/RecipeSchema.js");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

//Gets a single recipe from the database, currently unused, but exists as a model function
async function getOneRecipe()
{
    const corn = await recipeModel.findOne();
    return corn;
}

// Returns a default top-ten recipes,
async function getTopTenRecipes()
{
    let tenRecipes = await recipeModel.aggregate([
        //{$match: {NER: { $all: ["onion", "bacon", "salt", "potatoes"] }}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    return tenRecipes;
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

async function  findRecipeByIngredient(ingredients, excludedIngredients) {

    let array = ingredients.split(",");

  let excludedArray = excludedIngredients.split(",");

    let tenRecipes = await recipeModel.aggregate([
        {$match: {NER: { $all: array, $nin: excludedArray }}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    return tenRecipes;
}

async function getAIRecipeRecommendations(ingredients)
{
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
    You are a recipe recommendation assistant for college students.

    The user currently has these ingredients:
    ${ingredients}

    Return ONLY valid JSON in this format:

    {
    "recipes": [
        {
        "name": "",
        "description": "",
        "cookTime": "",
        "collegeReason": ""
        }
    ]
    }

    Recommend exactly 3 recipes.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const cleanedText = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleanedText);
}

module.exports = { getOneRecipe, getTopTenRecipes,findRecipeByIngredient, getAIRecipeRecommendations }

