const recipeManger = require("./recipeManager.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {getOneRecipe} = require("./recipeManager");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected")
    )
    .catch(err => console.log(err));

mongoose.connection.useDb('poop');

app.get("/", (req, res) => {
    res.send("apple");
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));

recipeManger.findRecipeByIngredient("bacon, onion");