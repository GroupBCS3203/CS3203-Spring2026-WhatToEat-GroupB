const dataModel = require("../models/UserDataSchema");
const userModel = require("../models/UserSchema");
const mongoose = require("mongoose");
const uauth = require("./uAuth");
const {encryptPass} = require("./uAuth");
const userManager = require("./userManager");
/*
* Currently a WIP version management system. Needs to be implemented, I'm down to work on this -Matthew
* */
async function addUserData(username, password){
    const newUserData = new dataModel({
        userID: await uauth.getUserID(username, password), 
        DietFilters: [], 
        plannedMeals: [],
        ownedIngredients: [],
        shoppingList:  ""
    });
    await newUserData.save();
}

async function addUser(username, password)
{
    const newUser = new userModel({
        username: username,
        password: uauth.encryptPass(password)
    });

    const dupeUser = await userModel.findOne({username: {$eq: username}},{},{});

    if (dupeUser == null) {
        await newUser.save();
        addUserData(username, password);
        return "success";
    }
    else
    {
        return "failed, duplicate"
    }
}

async function login(username, password)
{
    const UID = uauth.getUserID(username, password);
    return UID;
}

async function getUserData(userID)
{
    //Gets all data tied to a specific userID
    let data =
        await dataModel.findOne({userID: {$eq: userID}});
    return data;
}


// THIS IS AN EXAMPLE TO SAVE USER DATA, IMPLEMENT THIS IN A WAY THAT WORKS WITH THE CURRENT SCHEMA

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
//meal planner functions
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

module.exports = {addUser, login, getUserData, zip, saveIngredients, getPlannedMeals, savePlannedMeals}