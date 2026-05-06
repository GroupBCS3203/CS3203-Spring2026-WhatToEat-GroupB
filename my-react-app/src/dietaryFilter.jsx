import { useState, useEffect } from 'react'
import React from "react";
import { setExcludedIngredients as setGlobalExcludedIngredients, getUID, getExcludedIngredients } from "./varManager.jsx";

// Component DietaryFilter to take in an array and a function to update array (params)
export function DietaryFilter() {
  const dietFilterOptions = { // Maps all diet types, selecting ingredients to EXCLUDE
    Vegan: ["chicken", "beef", "steak", "pork", "bacon", "sausage", "ham", "lamb", "eggs"],
    "Nut-Free": ["almonds", "cashews", "peanuts", "peanut-butter", "peanut butter", "pecans"],
    "Gluten-Free": ["bread", "wheat", "barley", "rye", "triticale", "rolls", "bagels", "pasta", "flour"],
    "Dairy-Free": ["milk", "cheese", "yogurt", "butter", "cream", "ice cream", "whey", "chocolate"],
    "Seafood-Free": ["fish", "salmon", "tuna", "shrimp", "prawns", "lobster", "crab", "oysters", "grouper", "cod", "halibut", "swordfish", "trout"],
  };

  const [excludedIngredients, setExcludedIngredients] = useState(getExcludedIngredients());
  const uid = getUID();


  //Implemented a sleep function to wait for excludedIngredients to update inside varManager.jsx
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  //A function to get the excludedIngredidents from varManager.jsx, waits as it triggers when uid updates
  async function getData()
  {
    await sleep(100);
    const savedFilters = getExcludedIngredients();
    setExcludedIngredients(savedFilters);
  }


  //Anytime uid updates, get the excludedIngredients
  //This is what allows the UI to be updated in realTime for dietaryFilter
  useEffect(() => {
    if (uid !== 'none') {
      getData();
    }
  }, [uid]);





  // Send user exclusions from the frontend to backend
  async function saveExcludedIngredients(newExcludedIngredients) {
    await fetch(`${import.meta.env.VITE_API_URL}/api/user/saveDietFilters`, { // Sending request to backend
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tells backend data being sent is JSON
      },
      body: JSON.stringify({ // Converts object to JSON strings
        userID: getUID(), dietFilters: newExcludedIngredients, // Sends new excluded ingredient list
      }),
    });
  }
  
  // Only run if filter is selected
  function findExclusions(dietType) {
    console.log("Excluding: ");
    console.log(dietType);
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
      <p>(If you are logged in as a user, excluded ingredients will automatically save) </p>
      
      <ul>
        {excludedIngredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
}

