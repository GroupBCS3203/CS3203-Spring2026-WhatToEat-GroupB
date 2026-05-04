const recipeManager = require("./recipeManager.js");
const userManager = require("./userManagement/userManager.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const USE_MOCK_DB = true

app.use(cors());
app.use(express.json());

//Connects to the database
//mongoose.connect(process.env.MONGO_URI)
    //.then(() => console.log("MongoDB Connected")
    //)
    //.catch(err => console.log(err));

// Top 10 recipes api call
//app.get("/api/recipes/top", async (req, res) => {
//    res.json(await recipeManager.getTopTenRecipes());
//});

app.get("/api/recipes/top", async (req, res) => {
    return res.json([
        {
            _id: "1",
            title: "Cheesy Egg Fried Rice",
            ingredients: ["eggs", "rice", "cheese"],
            directions: ["Cook rice", "Scramble eggs", "Mix together"],
            link: "www.example.com",
            NER: ["eggs", "rice", "cheese"]
        },
        {
            _id: "2",
            title: "Grilled Cheese Sandwich",
            ingredients: ["bread", "cheese", "butter"],
            directions: ["Butter bread", "grill with cheese"],
            link: "www.example.com",
            NER: ["bread", "cheese", "butter"]
        },
        {
            _id: "3",
            title: "Simple Pasta",
            ingredients: ["pasta", "salt", "oil"],
            directions: ["Boil pasta", "Add salt", "Mix oil"],
            link: "www.example.com",
            NER: ["pasta", "salt", "oil"]
        }
    ]);
});

// One recipe api call
//app.get("/api/recipes/one", async (req, res) => {
//    res.json(await recipeManager.getOneRecipe());
//});

app.get("/api/recipes/one", async (req, res) => {
    return res.json({
        _id: "single-mock",
        title: "Mock Single Recipe",
        ingredients: ["mock ingredient 1", "mock ingredient 2"],
        directions: ["Do step 1", "Do step 2"],
        link: "www.example.com",
        NER: ["mock"]
    });
});

//Ingredient search api call
//app.get("/api/recipes/search", async (req, res) => {
 //   const ingredients = req.query.ingredients;
//    res.json(await recipeManager.findRecipeByIngredient(ingredients));
//});

app.get("/api/recipes/search", async (req, res) => {
    const ingredients = req.query.ingredients || "";

    return res.json([
        {
            _id: "mock-search-1",
            title: `Mock Recipe with ${ingredients}`,
            ingredients: ingredients.split(","),
            directions: [
                "Step 1: Gather ingredients",
                "Step 2: Cook everything together",
                "Step 3: Serve hot"
            ],
            link: "www.example.com",
            NER: ingredients.split(",")
        }
    ]);
});

//User api Calls

//Add user

//app.get("/api/user/adduser", async (req, res) => {
//    const user = req.query.user;
//    const pass = req.query.pass;
//    res.json(await userManager.addUser(user, pass));
//});

app.get("/api/user/adduser", async (req, res) => {
    const { user } = req.query;

    return res.json({
        status: "success (mock)",
        message: `User '${user}' created successfully (mock mode)`
    });
});

//Login user

//app.get("/api/user/login", async (req, res) => {
//    const user = req.query.user;
//    const pass = req.query.pass;
//    res.json(await userManager.login(user, pass));
//});

app.get("/api/user/login", async (req, res) => {
    const { user } = req.query;

    return res.json({
        status: "success (mock login)",
        userId: "mock-user-123",
        message: `User '${user}' logged in (mock mode)`
    });
});

//AI recipe recommendation api call

app.get("/api/recipes/ai", async (req, res) => {

    try {
        const ingredients = req.query.ingredients;
        const recommendations =
            await recipeManager.getAIRecipeRecommendations(ingredients);
        res.json({
            recommendations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to generate AI recommendations"
        });
    }
});

// Just consistently sets the port to 5000 to make testing easy
const PORT = process.env.PORT || 5000;

//Unsure if needed, but it's a relic of testing to make sure it closes correctly - DO NOT DELETE
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
//Allows calls of app
module.exports = app;