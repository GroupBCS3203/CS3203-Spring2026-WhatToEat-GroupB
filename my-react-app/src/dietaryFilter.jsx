import { useState } from 'react'
import React from "react";
import { setExcludedIngredients as setGlobalExcludedIngredients, getUID } from "./varManager.jsx";

// Component DietaryFilter to take in an array and a function to update array (params)
export function DietaryFilter({ excludedIngredients = [], setExcludedIngredients }) { 
  const dietFilterOptions = { // Maps all diet types, selecting ingredients to EXCLUDE
    Vegan: ["chicken", "beef", "steak", "pork", "bacon", "sausage", "ham", "lamb", "eggs"],
    "Nut-Free": ["almonds", "cashews", "peanuts", "peanut-butter", "peanut butter", "pecans"],
    "Gluten-Free": ["bread", "wheat", "barley", "rye", "triticale", "rolls", "bagels", "pasta", "flour"],
    "Dairy-Free": ["milk", "cheese", "yogurt", "butter", "cream", "ice cream", "whey", "chocolate"],
    "Seafood-Free": ["fish", "salmon", "tuna", "shrimp", "prawns", "lobster", "crab", "oysters", "grouper", "cod", "halibut", "swordfish", "trout"],
  };

  // Send user exclusions from the frontend to backend
  async function saveExcludedIngredients(newExcludedIngredients) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/saveDietFilters`, { // Sending request to backend
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tells backend data being sent is JSON
      },
      body: JSON.stringify({ // Converts object to JSON strings
        userID: getUID(), dietFilters: newExcludedIngredients, // Sends new excluded ingredient list
      }),
    });
    
    const result = await response.json();
    console.log("Saved diet filters:", result); // Success or failure from userManager.js
  }
  
  // Only run if filter is selected
  function findExclusions(dietType) {
    const foodsToExclude = dietFilterOptions[dietType];
    
    // Checks if all foods in foodsToExclude are alr in excludedIngredients
    const alreadySelected = foodsToExclude.every((food) => 
      excludedIngredients.includes(food)
    );
    // Store updated list
    let newExcludedIngredients;

    // If already selected, delete/remove
    if (alreadySelected) {
      newExcludedIngredients = excludedIngredients.filter(
        (item) => !foodsToExclude.includes(item)
      );
      // Else, combine existing exclusions, remove duplicate and turn into array
    } else {
      newExcludedIngredients = [
        ...new Set([...excludedIngredients, ...foodsToExclude]),
      ];
    }

    // Update both local and global states (same time to stay in sync) 
    setExcludedIngredients(newExcludedIngredients);
    setGlobalExcludedIngredients(newExcludedIngredients);
    saveExcludedIngredients(newExcludedIngredients);
  }

  // Prints excluded ingredients to user
  function searchRecipes() {
    console.log("Excluded:", excludedIngredients);
  }

  // Check which filter is selected and check if all excluded foods are included
  function isDietSelected(dietType) {
    const foods = dietFilterOptions[dietType];
    return foods.every((food) => excludedIngredients.includes(food));
  }

  return (
    <div>
      <h2>Dietary Filter</h2>

      <div>
        {Object.keys(dietFilterOptions).map((dietType) => {
          const selected = isDietSelected(dietType);

          return (
            <button
              key={dietType}
              onClick={() => findExclusions(dietType)}
              style={{
                backgroundColor: selected ? "green" : "lightgray",
                color: selected ? "white" : "black",
                margin: "5px",
                padding: "8px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {dietType}
            </button>
          );
        })}
      </div>

      <h3>Excluded Ingredients:</h3>

      <ul>
        {excludedIngredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
}

