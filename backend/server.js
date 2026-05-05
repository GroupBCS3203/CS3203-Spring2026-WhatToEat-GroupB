const recipeManager = require("./recipeManager.js");
const userManager = require("./userManagement/userManager.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const USE_MOCK_DB = false

app.use(cors());
app.use(express.json());

console.log("MONGO URI:", process.env.MONGO_URI);

//Connects to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected")
    )
    .catch(err => console.log(err));

// Top 10 recipes api call
app.get("/api/recipes/top", async (req, res) => {
    res.json(await recipeManager.getTopTenRecipes());
});


// One recipe api call
app.get("/api/recipes/one", async (req, res) => {
    res.json(await recipeManager.getOneRecipe());
});

//Ingredient search api call
app.get("/api/recipes/search", async (req, res) => {
   const ingredients = req.query.ingredients;
    res.json(await recipeManager.findRecipeByIngredient(ingredients));
});


//User api Calls

//save ingredients
app.get("/api/user/saveIngredients", async (req, res) => {
    //retrive the inputed data
    const UID = req.query.userID;
    const nameList = req.query.nameList;
    const amountList= req.query.amountList;
    const dateList= req.query.dateList;
    //run the actual function
    res.json(await userManager.saveIngredients(UID, userManager.zip(nameList, amountList, dateList)));
});

//Add user
app.get("/api/user/adduser", async (req, res) => {
    const user = req.query.user;
    const pass = req.query.pass;
    res.json(await userManager.addUser(user, pass));
});

//Login user
app.get("/api/user/login", async (req, res) => {
    const user = req.query.user;
    const pass = req.query.pass;
    res.json(await userManager.login(user, pass));
});

app.get("/api/user/getdata", async (req, res) => {
    const id = req.query.id;
    res.json(await userManager.getUserData(id));
});

//Get planned meals
app.get("/api/user/plannedMeals", async (req, res) => {
    const UID = req.query.userID;
    res.json(await userManager.getPlannedMeals(UID));
});

//Save planned meals
app.post("/api/user/plannedMeals", express.json(), async (req, res) => {
    const UID = req.body.userID;
    const events = req.body.events;
    await userManager.savePlannedMeals(UID, events);
    res.json({ success: true });
});

//THIS IS A TEMPLATE TO SAVE USER DATA, IMPLEMENT THIS IN SUCH A WAY THAT FITS WITH UserDataSchema.js,
app.post("/api/user/savedata", express.json(), async (req, res) => {
    const id = req.query.id;
    const data = req.query.data;
    res.json(await userManager.saveUserData(id));
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