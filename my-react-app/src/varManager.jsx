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


