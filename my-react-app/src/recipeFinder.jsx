import {useEffect, useState} from "react";
import {Button} from "./App.jsx";

export function RecipeFinder()
{
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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


    return(<div>
        <h3 style={{ color:'#ffffff' }}>
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

        {recipes.length === 0 ? (
            <p>Loading...</p>
        ) : (
            recipes.map(recipe => (
                <p key={recipe._id || recipe.title}>{recipe.title}</p>
            ))
        )}
    </div>)
}