import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [veganOnly, setVeganOnly] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await fetch("/api/recipes");
      const data = await response.json();
      setRecipes(data);
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = veganOnly
    ? recipes.filter((recipe) => recipe.isVegan)
    : recipes;

  return (
    <div className="app">
      <h1>WhatToEat</h1>
      
      <div className="filter-section">
        <label>
          <input
            type="checkbox"
            checked={veganOnly}
            onChange={(e) => setVeganOnly(e.target.checked)}
          />
          Vegan Only
        </label>
      </div>

      <div className="recipes-list">
        {filteredRecipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h2>{recipe.title}</h2>
            {recipe.isVegan && <span className="vegan-badge">Vegan</span>}
          </div>
        ))}
      </div>
    </div>
  );
}