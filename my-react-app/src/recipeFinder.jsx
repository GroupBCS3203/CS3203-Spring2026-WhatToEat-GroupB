import {useEffect, useState} from "react";
import {Button} from "./App.jsx";
import { createPortal } from "react-dom";

export function RecipeFinder()
{
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPopup, setShowPopup] = useState(false);

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
    }

    function searchByIngredient(ingredients) {
        fetch(`${import.meta.env.VITE_API_URL}/api/recipes/search?ingredients=${ingredients}`)
            .then(res => res.json())
            .then(data => setRecipes(data));
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
                <h3 style={{ color:'#ffffff' }}>
                    Recipe Browser
                </h3>
                <input
                    type="text"
                    placeholder="Search here..."
                    onChange={handleInputChange} // Attach the onChange event handler
                    value={searchTerm} // Control the input value with state
                />
            </div>

        );


return(<div>
        <h3 style={{ cursor: "pointer" , color:'#ffffff',  textDecoration: 'underline' }} onClick={() => setShowPopup(true)}>
            Recipe Browser
        </h3>
        <input
            type="text"
            placeholder="Search here..."
            onChange={handleInputChange} // Attach the onChange event handler
            value={searchTerm} // Control the input value with state
        />
        <Button onClick={() => searchRecipes()}>
            Get 10 Recipes
        </Button>

        {showPopup &&
        createPortal(
            Popup,
            document.body
        )}

        <button onClick={() => setShowPopup(true)}>Open Popup</button>
        <button onClick={() => setShowPopup(false)}> Press me to print a message! </button>

        <Button onClick={() => Popup()}>
            Get 20 Recipes
        </Button>

        {recipes.length === 0 ? (
            <p>Loading...</p>
        ) : (
            recipes.map(recipe => (
                <p key={recipe._id || recipe.title}>{recipe.title}</p>
            ))
        )}
    </div>)
}

const styles = {
    popup: {
        position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            zIndex: 9999,
    },
};