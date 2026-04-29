const userModel = require("../models/UserSchema");
const crypto = require('crypto');
require("dotenv").config();
const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(process.env.SECRET_KEY, "salt", 32); // 32 bytes key
const IV = crypto.scryptSync(process.env.IV, "salt", 16);

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

async function getUserID(username, password)
{
    const foundUser = await userModel.findOne(
        {username: username, password: encryptPass(password)},
    );

    let returnVal = "";

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
