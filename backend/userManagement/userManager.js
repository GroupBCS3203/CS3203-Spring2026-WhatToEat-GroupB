const recipeModel = require("../models/UserSchema.js");
const mongoose = require("mongoose");

const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

/*
* Currently a WIP version management system. Needs to be implemented, I'm down to work on this -Matthew
* */


async function getOneRecipe()
{
    const corn = await recipeModel.findOne();
    return corn;
}

module.exports = {makeKey}