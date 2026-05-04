const dataModel = require("../models/UserDataSchema");
const userModel = require("../models/UserSchema");
const mongoose = require("mongoose");
const uauth = require("./uAuth");
const {encryptPass} = require("./uAuth");
const userManager = require("./userManager");
/*
* Currently a WIP version management system. Needs to be implemented, I'm down to work on this -Matthew
* */


async function addUser(username, password)
{
    const newUser = new userModel({
        username: username,
        password: uauth.encryptPass(password)
    });

    const dupeUser = await userModel.findOne({username: {$eq: username}},{},{});

    if (dupeUser == null) {
        await newUser.save();
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
    await dataModel.aggregate([
        {$match: {userID: userID }}
    ]);

}
//ingredient tracker helper function
function zip(l1, l2, l3){
    var element;
    for(let i = 0; i<length.length; i++){
        output.push([l1[i], l2[i], l3[i] ]);
    }
}
//ingredient tracker save function
async function saveIngredients(ID, list) {
    const userData = await dataModel.findOne({userID: {$eq: ID}});
    userData.ownedIngredients = list; //placeholder data
    userData.save();
}

module.exports = {addUser, login, getUserData}