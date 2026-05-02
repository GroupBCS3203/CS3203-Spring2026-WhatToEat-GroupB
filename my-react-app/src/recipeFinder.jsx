import {useEffect, useState} from "react";
import {Button} from "./App.jsx";
import {getUID, setRecipes as setGlobalRecipes} from "./varManager.jsx";



export function RecipeFinder()
{

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

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(err => console.error(err));
    }, []);

    function getTopTen() {
        fetch(`${import.meta.env.VITE_API_URL}/api/recipes/top`)
            .then(res => res.json())
            .then(data => setRecipes(data));
        setGlobalRecipes(recipes);
    }

    function searchByIngredient(ingredients) {
        fetch(`${import.meta.env.VITE_API_URL}/api/recipes/search?ingredients=${ingredients}`)
            .then(res => res.json())
            .then(data => setRecipes(data));
        setGlobalRecipes(recipes);
    }
    // Updates the search term to be lower case
    const handleInputChange = (event) => {
        // Convert input to lowercase for case-insensitive searching
        setSearchTerm(event.target.value.toLowerCase());
    };
    function searchRecipes() {
        if (searchTerm.length > 0) {
            searchByIngredient(searchTerm);
        } else {
            getTopTen();
        }
    }

    let Popup =
        (
            <div style={styles.popup}>
                <button style={{ backgroundColor: 'red', color: 'white', alignItems: 'flex-end' }} onClick={() => setShowPopup(false)}>
                    Close Recipe
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


        {showPopup && //This is the popup logic
            Popup
        }

        {recipes.length === 0 ? (
            <p>Loading...</p>
        ) : (
            recipes.map(recipe => (
                <p key={recipe._id || recipe.title}
                   style={{ color:'#ffffff', cursor: "pointer" ,  textDecoration: 'underline' }}
                   onClick={() => runPopup(recipe)}
                >
                    {recipe.title}
                </p>
            ))
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