const dataModel = require("../models/UserDataSchema");
const userModel = require("../models/UserSchema");
const uauth = require("./uAuth");


/* Important note for entire sections:
*
* CWE-1060: Excessive Number of Inefficient Server-Side Data Accesses, was considered in these queries, making it so that
* only single queries were made for user login info.
*
* */

// Creates a default box to put userData into, making it less likely to create duplicate documents for a single user
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

// Registers a user account if it has a unique username
async function addUser(username, password)
{
    const newUser = new userModel({
        username: username,
        password: uauth.encryptPass(password)
    });

    //Creates a dupe user if another user is found with the same username
    const dupeUser = await userModel.findOne({username: {$eq: username}},{},{});

    //checks if the username is taken, and if not, registers the user.
    if (dupeUser == null) {
        await newUser.save();
        await addUserData(username, password);
        return "success";
    }
    else
    {
        return "failed, duplicate"
    }
}

// Logs in by getting the user and password, sending it to uauth for validation, and returning uauth's result
async function login(username, password)
{
    const UID = uauth.getUserID(username, password);
    return UID;
}


module.exports = {addUser, login}