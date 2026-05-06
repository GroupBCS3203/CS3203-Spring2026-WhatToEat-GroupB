import {useEffect, useState} from "react";
import {Button} from "./App.jsx";
import {getUID, setRecipes as setGlobalRecipes, addSavedRecipe, getSavedRecipes, removeSavedRecipe, isRecipeSaved, getExcludedIngredients} from "./varManager.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function RecipeFinder()
{
    //BaseJSON so that the code has an example of the recipe format
    const baseJSON = {
        "_id": {
            "$oid": "2"
        },
        "title": "Blank Recipe",
        "ingredients": [""],
        "directions": [""],
        "link": "www.google.com",
        "NER": []
    }

    //Various Variables throughout the code
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popUpRecipe, setPopUpRecipe] = useState(baseJSON);
    const [showSaved, setShowSaved] = useState(false);
    const [popUpSaved, setPopUpSaved] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [loading, setLoading] = useState(false); //load state is true whenever we start a search


    //Automatically fills the page with recipes
    useEffect(() => {
        fetch(`${BASE_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(err => console.error(err));
    }, []);


    //Gets the top ten recipes the API produces without search terms
    function getTopTen() {
        setLoading(true);
        fetch(`${BASE_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setGlobalRecipes(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }

    function searchByIngredient(ingredients) {
        setLoading(true);
        const excludedIngredients = getExcludedIngredients(); 
        const excludedQuery = excludedIngredients.join(","); // New query without excluded ingredients
        
        fetch(`${BASE_URL}/api/recipes/search?ingredients=${ingredients}&excluded=${excludedQuery}`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setGlobalRecipes(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }
    
    // Search for recipes with LLM assistance
    function searchAIRecipes(ingredients) {
        setLoading(true);
        //fetches based on input ingredients
        fetch(`${BASE_URL}/api/recipes/ai?ingredients=${ingredients}`)
            .then(res => res.json())
            .then(data => {
                // Same setup as other searches, but requires direct mapping of each trait of the recipe since the AI response format is different than our database format
                const aiRecipes = data?.recommendations?.recipes?.map(r => ({
                    title: r.name,
                    ingredients: r.ingredients,
                    directions: r.instructions,
                    link: "",
                    NER: [],
                })) || [];

                setRecipes(aiRecipes);
                setGlobalRecipes(aiRecipes);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }


    async function saveRecipesToBackend() {
        if (getUID() === 'none') return;
        const returnRecipes = getSavedRecipes();
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/user/saveSavedRecipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: getUID(), returnRecipes: returnRecipes }),
            });
        } catch (error) {
            console.error('Failed to save planned meals:', error);
        }
    }
    // Updates the search term to be lower case
    const handleInputChange = (event) => {
        // Convert input to lowercase for case-insensitive searching
        setSearchTerm(event.target.value.toLowerCase());
    };

    function searchRecipes() {
        //This if decides which call to make
        if (searchTerm.length > 0 || (getExcludedIngredients().length > 0 )) {
            if (useAI) {
                //Searches with AI
                //only triggers with the flag on and a search term/excludedIngredident, currently ignores filters
                searchAIRecipes(searchTerm);
            } else {
                //Searches without AI
                //only triggers with the flag on and a search term/excluded ingredent list (basically anything to filter by)
                searchByIngredient(searchTerm);
            }
        } else {
            //Gets the top ten, runs if no filters are given
            getTopTen();
        }
        setShowSaved(false);
    }

    //Pulls up a user's saved recipes
    function viewSavedRecipes() {
        const saved = getSavedRecipes();
        setRecipes(saved);
        setGlobalRecipes(saved);
        setShowSaved(true);
    }

    // Handles the logic of a user saving and unsaving a recipe
    function handleSaveToggle() {
        if (isRecipeSaved(popUpRecipe)) {
            removeSavedRecipe(popUpRecipe);
            setPopUpSaved(false);
        } else {
            addSavedRecipe(popUpRecipe);
            setPopUpSaved(true);
        }
        saveRecipesToBackend();
    }


    //Defines the pop-up object, dynaically
    let Popup =
        (
            <div style={styles.popup}>
                <button style={{ backgroundColor: 'red', color: 'white', alignItems: 'flex-end' }} onClick={() => setShowPopup(false)}>
                    Close Recipe
                </button>
                <button style={{ backgroundColor: popUpSaved ? '#b33' : 'green', color: 'white', marginLeft: '10px' }} onClick={handleSaveToggle}>
                    {popUpSaved ? 'Remove Saved Recipe' : 'Save Recipe'}
                </button>
                <h1 style={{ color:'#ffffff' }}>
                    {popUpRecipe.title}
                </h1>
                    <h2 style={{ color:'#ffffff' }}>
                        Ingredients:
                    </h2>
                    <ul>
                        {popUpRecipe.ingredients.map(ingredient => (<li>{ingredient}</li>))}
                    </ul>

                    <h2 style={{ color:'#ffffff' }}>
                        Instructions:
                    </h2>
                    <ol style={{alignItems:'left'}}>
                        {popUpRecipe.directions.map(direction => (<li>{direction}</li>))}
                    </ol>
                    <h4>
                        Link: <a href={`https://${popUpRecipe.link.slice(4)}`}> {popUpRecipe.link} </a>
                    </h4>
                <button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => setShowPopup(false)}>
                    Close Recipe
                </button>
            </div>

        );

    //Defines the aspects of the Popup object
    function setPopup(recipe) {
        setPopUpRecipe(recipe);
        setPopUpSaved(isRecipeSaved(recipe));
    }

    //Shows the popup
    function runPopup(recipe)
    {
        setPopup(recipe);
        setShowPopup(true);
    }


    //Defines the mainPage to be returned to App.jsx
    let mainPage = <div>
        <h3 style={{ color:'#ffffff' }} onClick={() => setShowPopup(true)}>
            Recipe Browser
        </h3>
        <input
            type="text"
            placeholder="Search ingredients here..."
            onChange={handleInputChange} // Attach the onChange event handler
            value={searchTerm} // Control the input value with state
        />
        <Button onClick={() => searchRecipes()}>
            Find Recipes
        </Button>
        <Button onClick={() => viewSavedRecipes()}>
            View Saved Recipes
        </Button>

        <Button onClick={() => setUseAI(!useAI)}>
            {useAI ? 'Using AI: ON' : 'Using AI: OFF'}
        </Button>
        {showPopup && //This is the popup logic
            Popup
        }

        {loading ? (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color:'#ffffff' }}>
                    Finding recipes...
                </p>
            </div>
        ) : recipes.length === 0 ? (
            <p style={{ color:'#ffffff' }}>
                No recipes found.
            </p>
        ) : (
            <div>
                <h4 style={{ color:'#ffffff' }}>
                    {showSaved ? 'Saved Recipes' : 'Search Results'}
                </h4>
                {recipes.map(recipe => (
                    <p key={recipe._id || recipe.title}
                       style={{ color:'#ffffff', cursor: "pointer" ,  textDecoration: 'underline' }}
                       onClick={() => runPopup(recipe)}
                    >
                        {recipe.title}
                    </p>
                ))}
            </div>
        )}
    </div>

mainPage = (
    <>
        <style>
        {`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}
        </style>

        {mainPage}
    </>
);

return(mainPage);
}

//Styles to make our stuff look less bad
const styles = {
    popup: {
        position: "fixed",
            top: "50%", //First three lines serve to center the box
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#242424",
            border: "1px solid white",
            padding: "20px",
            zIndex: 9999,
        display: 'flex',
        flexDirection: 'column', // Stack children vertically
        alignItems: 'flex-start', // Align children to the left
        textAlign: 'left',
        overflowY: 'auto',
        height: '60%',
        width: '60%',
    },

    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
    },

    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #555",
        borderTop: "4px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
};
