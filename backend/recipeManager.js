const recipeModel = require("./models/RecipeSchema.js");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");


/* Important note for entire sections:
*
* CWE-1060: Excessive Number of Inefficient Server-Side Data Accesses, was considered in these queries, making it so that
* only single queries were made for recipe data.
*
* */

//Gets a single recipe from the database, currently unused, but exists as a model function
async function getOneRecipe()
{
    const corn = await recipeModel.findOne();
    return corn;
}

// Returns the default top-ten recipes,
async function getTopTenRecipes()
{
    //A way of implementing
    let tenRecipes = await recipeModel.aggregate([
        //{$match: {NER: { $all: ["onion", "bacon", "salt", "potatoes"] }}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    return tenRecipes;
}

//Makes a list of every unique NER element the database contains
//Currently a relic, but could be used in the future
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

//Finds recipes that meet both the criteria of having all ingredients while having zero exclusions
async function findRecipeByIngredient(ingredients, excludedIngredients) {

    let array = [];
    let excludedArray = [];

    // Exists to make sure ingredients and excludedIngredients are usable, then splits for query usage
    if (!ingredients) {
        console.error('ingredients is undefined :)');
    }
    else
    {
        array = ingredients.split(",");
    }

    if (!excludedIngredients) {
        console.error('excludedIngredients is undefined');
    }
    else
    {
        excludedArray = excludedIngredients.split(",");
    }


    // Due to how $all works, we need to check if array is empty, and if it isn't we pass a query with both $all and $nin,
    // otherwise we just pass $nin
    let query = {};

    if (array.length > 0) {
        query = { $all: array, $nin: excludedArray };
    }
    else
    {
        query = { $nin: excludedArray }
    }


    //Basically a repeat of getTopTen, but now we have a match condition for the two arrays
    let tenRecipes = await recipeModel.aggregate([
        {$match: {NER: query}},
        { $group: { _id: "$title", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $limit: 10 }
    ]);

    return tenRecipes;
}

// Access LLM to get recipe outside of database
async function getAIRecipeRecommendations(ingredients)
{
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
    You are a recipe recommendation assistant for college students.

    The user currently has these ingredients:
    ${ingredients}

    Return ONLY valid JSON.

    Requirements:
    - Recommend exactly 10 recipes.
    - Each recipe must contain:
    - "name"
    - "ingredients"
    - "instructions"
    - "ingredients" MUST be an array where EACH ingredient is its own separate string entry including measurements.
    - "instructions" MUST be an array where EACH instruction step is its own separate string entry.
    - Do NOT combine ingredients into one comma-separated string.
    - Do NOT combine instructions into one paragraph.
    - No markdown.
    - No explanation text.
    - No code fences.

    Use this EXACT format:

    {
    "recipes": [
        {
        "name": "Recipe Name",
        "ingredients": [
            "1 cup rice",
            "2 eggs",
            "1/2 cup shredded cheese"
        ],
        "instructions": [
            "Cook the rice according to package instructions.",
            "Scramble the eggs in a skillet.",
            "Mix the rice and eggs together.",
            "Add cheese and stir until melted."
        ]
        }
    ]
    }
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

