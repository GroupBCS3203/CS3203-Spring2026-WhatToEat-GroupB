const dataModel = require("../models/UserDataSchema");


/* Important note for entire sections:
*
* CWE-1060: Excessive Number of Inefficient Server-Side Data Accesses, was considered in these queries, making it so that
* 1-2 queries were made for stored user data.
*
* */

//Gets all data tied to a specific userID
async function getUserData(userID)
{
    let data =
        await dataModel.findOne({userID: {$eq: userID}});
    return data;
}


// THIS IS AN EXAMPLE TO SAVE USER DATA, NOT FUNCTIONAL

async function saveUserData(userID, data)
{
    //Gets all data tied to a specific userID
    const findUser = await dataModel.findOne({userID: {$eq: userID}},{},{});

    if (findUser != null) {
        findUser.savedRecipes = data;
        await findUser.save();
    }
    return data;
}



//ingredient tracker helper function. Puts the 3 string lists into a single list.
function zip(l1, l2, l3){
    var output = [];
    for(let i = 0; i<l1.length-1; i++){
        output.push([l1[i], parseInt(l2[i]), l3[i] ]);
    }
    return output;
}

//ingredient tracker save function. Just puts the inputed list into the userData schema.
async function saveIngredients(ID, list) {

    const userData = await dataModel.findOne({userID: {$eq: ID}});

    if(userData != null){

        userData.ownedIngredients = list; //placeholder data
        userData.save();
        console.log("saveIngredients success");
        return "success";
    }else{
        console.log("saveIngredients failure");
        return "failure";
    }

}
//meal planner get function
async function getPlannedMeals(userID) {
    const userData = await dataModel.findOne({userID: {$eq: userID}});
    if (!userData) return [];
    return userData.plannedMeals || [];
}
//meal planner save function
async function savePlannedMeals(userID, events) {
    await dataModel.findOneAndUpdate(
        {userID: {$eq: userID}},
        {plannedMeals: events},
        {upsert: true, new: true}
    );
}
// Dietary filter function, find user and update new filter in database
async function saveDietFilters(ID, list) { // Recieve user ID and list of excluded foods
    console.log(list);
    await dataModel.findOneAndUpdate(
        { userID: ID },
        { $set: { "dietFilters": list } },
        { returnDocument: "after" }
    );
}

// Saves the saved recipes of an user
async function saveSavedRecipes(userID, recipes) {
    await dataModel.findOneAndUpdate(
        { userID: userID },
        { $set: { "savedRecipes.recipes": recipes } },
        { new: true }
    );
}

module.exports = { getUserData, zip, saveIngredients, saveSavedRecipes, getPlannedMeals, savePlannedMeals, saveDietFilters}