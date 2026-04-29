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

module.exports = {addUser, login, getUserData}