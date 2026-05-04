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
        plannedMeals: "", 
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
    console.log(userID);
    console.log("MEGA STICK");
    console.log(data.userID);
    console.log(data._id);
    console.log(data.__v);
    console.log(data.ownedIngredients);

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



//ingredient tracker helper function
function zip(l1, l2, l3){
    var output = [];
    for(let i = 0; i<l1.length-1; i++){
        output.push([l1[i], parseInt(l2[i]), Date.parse(l3[i]) ]);
    }
    return output;
}
//ingredient tracker save function
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

module.exports = {addUser, login, getUserData, zip, saveIngredients}