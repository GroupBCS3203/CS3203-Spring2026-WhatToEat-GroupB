const blankRecipe = {
    "_id": {
        "$oid": "2"
    },
    "title": "Blank Recipe",
    "ingredients": [""],
    "directions": [""],
    "link": "www.google.com",
    "NER": []
}


let UID = 'none';
let recipes = [blankRecipe];
let recipe = blankRecipe;
let savedRecipes = [];
let userIngredients = [];


export function getUID()
{
    return UID;
}

export function setUID(newUID)
{
    UID = newUID;
}

export function getRecipes()
{
    return recipes;
}

export function setRecipes(recipeList)
{
    recipes = recipeList;
}

export function getRecipe()
{
    return recipe;
}

export function setRecipe(newRecipe)
{
    recipe = newRecipe;
}

function getRecipeKey(recipe) {
    if (!recipe) return undefined;
    if (recipe._id && typeof recipe._id === 'object' && '$oid' in recipe._id) {
        return recipe._id.$oid;
    }
    return recipe._id ?? recipe.title;
}

export function getSavedRecipes()
{
    return savedRecipes;
}

export function setSavedRecipes(recipes)
{
    savedRecipes = recipes;
}

export function addSavedRecipe(recipe)
{
    const key = getRecipeKey(recipe);
    if (!savedRecipes.find(r => getRecipeKey(r) === key)) {
        savedRecipes.push(recipe);
    }
}

export function removeSavedRecipe(recipe)
{
    const key = getRecipeKey(recipe);
    savedRecipes = savedRecipes.filter(r => getRecipeKey(r) !== key);
}

export function isRecipeSaved(recipe)
{
    const key = getRecipeKey(recipe);
    return savedRecipes.some(r => getRecipeKey(r) === key);
}

export function getUserIngredients()
{
    return userIngredients;
}

export function setUserIngredients(ingredients)
{
    userIngredients = ingredients;
}


