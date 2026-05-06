const userModel = require("../models/UserSchema");
const crypto = require('crypto');
require("dotenv").config();
const ALGORITHM = "aes-256-gcm";
const salt = 'a-very-unique-secret-salt';
const KEY = crypto.scryptSync(process.env.SECRET_KEY, salt, 32);
const IV = crypto.scryptSync(process.env.IV, salt, 16);

/*
* This is a homemade UAuth system
* */

//This encrypts any password given to it, used both for storage and validation
function encryptPass(password) {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);

    const encrypted = Buffer.concat([
        cipher.update(password, "utf8"),
        cipher.final()
    ]);

    console.log("stinky");
    console.log(encrypted.toString("hex"));

    return encrypted.toString("hex");
}

//Takes in login-credentials and returns a userID if they match an existing user
async function getUserID(username, password)
{
    const foundUser = await userModel.findOne(
        {username: username, password: encryptPass(password)},
    );

    let returnVal = "";

    //Returns the userID if found, 'none' is not
    if (foundUser != null) {
        returnVal = foundUser._id.toString();
    }
    else
    {
        returnVal = "none";
    }
    return returnVal;
}


module.exports = { encryptPass, getUserID };
