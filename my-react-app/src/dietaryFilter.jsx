import { useState } from 'react'
import React from "react";
import { setExcludedIngredients as setGlobalExcludedIngredients } from "./varManager.jsx";

export function DietaryFilter({ excludedIngredients = [], setExcludedIngredients }) {
  const dietFilterOptions = {
    Vegan: ["chicken", "beef", "steak", "pork", "bacon", "sausage", "ham", "lamb", "eggs"],
    "Nut-Free": ["almonds", "cashews", "peanuts", "peanut-butter", "peanut butter", "pecans"],
    "Gluten-Free": ["bread", "wheat", "barley", "rye", "triticale", "rolls", "bagels", "pasta", "flour"],
    "Dairy-Free": ["milk", "cheese", "yogurt", "butter", "cream", "ice cream", "whey", "chocolate"],
    "Seafood-Free": ["fish", "salmon", "tuna", "shrimp", "prawns", "lobster", "crab", "oysters", "grouper", "cod", "halibut", "swordfish", "trout"],
  };

  function findExclusions(dietType) {
    const foodsToExclude = dietFilterOptions[dietType];

    const alreadySelected = foodsToExclude.every((food) =>
      excludedIngredients.includes(food)
    );

    let newExcludedIngredients;

    if (alreadySelected) {
      newExcludedIngredients = excludedIngredients.filter(
        (item) => !foodsToExclude.includes(item)
      );
    } else {
      newExcludedIngredients = [
        ...new Set([...excludedIngredients, ...foodsToExclude]),
      ];
    }

    setExcludedIngredients(newExcludedIngredients);
    setGlobalExcludedIngredients(newExcludedIngredients);
  }

  function searchRecipes() {
    console.log("Excluded:", excludedIngredients);
  }

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

