import {useEffect, useState} from "react";
import {Button} from "./App.jsx";
import {getUID, setRecipes as setGlobalRecipes, addSavedRecipe, getSavedRecipes, removeSavedRecipe, isRecipeSaved} from "./varManager.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function RecipeFinder()
{
    console.log("API BASE URL:", import.meta.env.VITE_API_URL);

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

    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popUpRecipe, setPopUpRecipe] = useState(baseJSON);
    const [showSaved, setShowSaved] = useState(false);
    const [popUpSaved, setPopUpSaved] = useState(false);
    const [useAI, setUseAI] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(err => console.error(err));
    }, []);

    function getTopTen() {
        fetch(`${BASE_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setGlobalRecipes(data);
            })
            .catch(err => console.error(err));
    }

    function searchByIngredient(ingredients) {
        const excludedIngredients = getExcludedIngredients(); 
        const excludedQuery = excludedIngredients.join(","); // New query without excluded ingredients
        
        fetch(`${BASE_URL}/api/recipes/search?ingredients=${ingredients}`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setGlobalRecipes(data);
            })
            .catch(err => console.error(err));
    }
    
    function searchAIRecipes(ingredients) {
    fetch(`${BASE_URL}/api/recipes/ai?ingredients=${ingredients}`)
        .then(res => res.json())
        .then(data => {
            // IMPORTANT: convert AI format → UI format
            const aiRecipes = data?.recommendations?.recipes?.map(r => ({
                title: r.name,
                ingredients: [],
                directions: [r.description],
                link: "",
                NER: [],
                cookTime: r.cookTime,
                collegeReason: r.collegeReason
            })) || [];

            setRecipes(aiRecipes);
            setGlobalRecipes(aiRecipes);
        })
        .catch(err => console.error(err));
    }
    // Updates the search term to be lower case
    const handleInputChange = (event) => {
        // Convert input to lowercase for case-insensitive searching
        setSearchTerm(event.target.value.toLowerCase());
    };

    function searchRecipes() {
        if (searchTerm.length > 0) {
            if (useAI) {
                searchAIRecipes(searchTerm);
            } else {
                searchByIngredient(searchTerm);
            }
        } else {
            getTopTen();
        }
        setShowSaved(false);
    }

    function viewSavedRecipes() {
        const saved = getSavedRecipes();
        setRecipes(saved);
        setGlobalRecipes(saved);
        setShowSaved(true);
    }

    function handleSaveToggle() {
        if (isRecipeSaved(popUpRecipe)) {
            removeSavedRecipe(popUpRecipe);
            setPopUpSaved(false);
        } else {
            addSavedRecipe(popUpRecipe);
            setPopUpSaved(true);
        }
    }

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

    function setPopup(recipe) {
        setPopUpRecipe(recipe);
        setPopUpSaved(isRecipeSaved(recipe));
    }

    function runPopup(recipe)
    {
        setPopup(recipe);
        setShowPopup(true);
    }


    let mainPage = <div>
        <h3 style={{ color:'#ffffff', cursor: "pointer" ,  textDecoration: 'underline' }} onClick={() => setShowPopup(true)}>
            Recipe Browser
        </h3>
        <input
            type="text"
            placeholder="Search here..."
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

        {recipes.length === 0 ? (
            <p>Loading...</p>
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


return(mainPage);
}

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
    }
};
