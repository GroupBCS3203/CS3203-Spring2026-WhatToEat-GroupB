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

const blankData = {
    "userID": "apple",
    "dietFilters": [""],
    "plannedMeals": {"lineItems": []},
    "savedRecipes": {"recipes": []},
    "ownedIngredients": [["String", 1, Date.now()]],
    "shoppingList": {"lineItems": []}
}


let UID = 'none';
let recipes = [blankRecipe];
let savedRecipes = [];
let savedPlans = [];
let shoppingList = [];
let savedFilters = [];
let userIngredients = blankData.ownedIngredients;
let excludedIngredients = [];

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



export async function setUserData(id)
{

    console.log("ULTRA STINK >:)")
    console.log(id);
    console.log(UID);

    let allUserData = blankData;
    await fetch(`${import.meta.env.VITE_API_URL}/api/user/getdata?id=${UID}`)
        .then(res => res.json())
        .then(data => {
            console.log("ULTRA STINK 2 >:)");
            allUserData = data;
        })
        .catch(err => console.error(err));

    console.log("STINK INVASION");
    console.log(allUserData.userID);
    console.log(allUserData.ownedIngredients);


    savedRecipes = allUserData.savedRecipes.recipes;
    savedPlans = allUserData.plannedMeals.lineItems;
    shoppingList = allUserData.shoppingList.lineItems;
    savedFilters = allUserData.dietFilters;
    userIngredients = allUserData.ownedIngredients;
}

