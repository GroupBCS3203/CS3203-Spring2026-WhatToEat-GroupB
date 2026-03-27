import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg?url'
import './App.css'
import { useRef, useEffect } from "react";




function Button({ onClick, children }) {
  return (
    <button className='button' onClick={onClick}>
      {children}
    </button>
  );
}

function Tabbutton({ feature }) {

  function handlePlayClick() {
    var i, tabcontent;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
       document.getElementById(feature).style.display = "block";
  }

  return (
    <Button onClick={handlePlayClick}>
     {feature}
    </Button>
  );
}


function App() {

  const [recipes, setRecipes] = useState([]);

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

  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    // Convert input to lowercase for case-insensitive searching
    setSearchTerm(event.target.value.toLowerCase());
  };

  function searchRecipes() {
    if (searchTerm.length > 0) {
      searchByIngredient(searchTerm);
    }
    else
    {
      getTopTen();
    }
  }

  function openFeature(feature) {
      
       
    }
    

  const [count, setCount] = useState(0)

  return (
    <>
      <div className="tab">
          <Tabbutton feature = "recipes" />
          <Tabbutton feature = "login" />
          <Tabbutton feature = "planner" />
          <Tabbutton feature = "budget" />
        </div>

        <div id="recipes" className="tabcontent" style={{ color:'#ffffff', display: "block"}}>
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
                  <p>{recipe.title}</p>
              ))
          )}
        </div>

        <div id="login" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Logic
          </h3>
          <p>placeholder.</p>
        </div>

        <div id="planner" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Meal Planner
          </h3>
          <p>placeholder.</p>
        </div>

        <div id="budget" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Budget Tracker
          </h3>
          <p>placeholder.</p>
        </div>
    </>
  )


  

}

export default App
