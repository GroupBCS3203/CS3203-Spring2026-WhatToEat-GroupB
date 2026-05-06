//This is the global variable controller, kinda archaic, but it works


// Blank recipe to serve as a referencable model of a recipe
const blankRecipe = {
    "_id": {
        "$oid": "2"
    },
    "title": "Blank Recipe",
    "ingredients": [""],
    "directions": [""],
    "link": "google.com",
    "NER": []
}

// Blank dataModel to serve as a referencable model of a user's data
const blankData = {
    userID: "apple",
    dietFilters: [""],
    plannedMeals: {lineItems: []},
    savedRecipes: {recipes: [blankRecipe]},
    ownedIngredients: [["String", 1, Date.now()]],
    shoppingList: {lineItems: []}
}



//Global variables
let UID = 'none';
let recipes = [blankRecipe];
let savedRecipes = [];
let savedPlans = [];
let shoppingList = [];
let savedFilters = [];
let userIngredients = blankData.ownedIngredients;
let excludedIngredients = [];


// Self-explanatory getters and setters
export function getExcludedIngredients() {
    return excludedIngredients;
}

export function setExcludedIngredients(newExcludedIngredients) {
    excludedIngredients = newExcludedIngredients;
}

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

// All of these are meant to help handle the saved recipes
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
// adds a saved recipe to the existing list
export function addSavedRecipe(recipe)
{
    const key = getRecipeKey(recipe);
    if (!savedRecipes.find(r => getRecipeKey(r) === key)) {
        savedRecipes.push(recipe);
    }
}

// removes a given saved recipe from the existing list
export function removeSavedRecipe(recipe)
{
    const key = getRecipeKey(recipe);
    savedRecipes = savedRecipes.filter(r => getRecipeKey(r) !== key);
}

//Checks if a recipe is saved
export function isRecipeSaved(recipe)
{
    const key = getRecipeKey(recipe);
    return savedRecipes.some(r => getRecipeKey(r) === key);
}

// More getters and setters
export function getUserIngredients()
{
    return userIngredients;
}

export function setUserIngredients(ingredients)
{
    userIngredients = ingredients;
}

//Sets the global variables to the based on a user's data
export async function setUserData(id)
{

    let allUserData = blankData;
    await fetch(`${import.meta.env.VITE_API_URL}/api/user/getdata?id=${UID}`)
        .then(res => res.json())
        .then(data => {
            allUserData = data;
        })
        .catch(err => console.error(err));


    try {
        savedRecipes = allUserData.savedRecipes.recipes;
        savedPlans = allUserData.plannedMeals.lineItems;
        shoppingList = allUserData.shoppingList.lineItems;
        excludedIngredients = allUserData.dietFilters;
        userIngredients = allUserData.ownedIngredients;
    }
    catch(err) {
        console.log(err);
    }
}

