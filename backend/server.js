const recipeManager = require("./recipeManager.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected")
    )
    .catch(err => console.log(err));

// Top 10 recipes
app.get("/api/recipes/top", async (req, res) => {
    res.json(await recipeManager.getTopTenRecipes());
});

// Get one recipe
app.get("/api/recipes/one", async (req, res) => {
    res.json(await recipeManager.getOneRecipe());
});

/* Ingredient search
app.get("/api/recipes/search", async (req, res) => {
    const ingredients = req.query.ingredients;
    res.json(await recipeManager.findRecipeByIngredient(ingredients));
});

 */



const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
module.exports = app;