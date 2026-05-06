import { useState } from 'react';
import { getSavedRecipes, getUserIngredients } from './varManager.jsx';

// ShoppingList displays ingredients that are needed for saved recipes.
// It also shows ingredients the user already has at home for reference while shopping.
// It supports recipe data stored as arrays or comma-separated strings.
export function ShoppingList({ recipes }) {
  // shoppingItems stores recipes with their needed ingredients, grouped by recipe.
  const [shoppingItems, setShoppingItems] = useState([]);
  // homeItems stores the list of ingredients the user already has at home.
  const [homeItems, setHomeItems] = useState([]);
  // shoppingLoaded is used to determine whether the list has been generated.
  const [shoppingLoaded, setShoppingLoaded] = useState(false);

  // Normalize ingredient values for comparison.
  // This is important for deduplication and user-stock filtering.
  function normalizeIngredientName(ingredient) {
    return typeof ingredient === 'string' ? ingredient.toLowerCase().trim() : '';
  }

  // Extract the ingredient name from stored format.
  // User ingredients can be stored in multiple formats:
  // 1. Simple array: [name, quantity, date]
  // 2. Complex object: { id, text: {info: [name, amount, expiration]} }
  // 3. String: "name"
  function extractStoredIngredientName(storedIng) {
    if (typeof storedIng === 'string') {
      return storedIng;
    }
    if (Array.isArray(storedIng) && storedIng.length > 0) {
      // Handle simple array format [name, quantity, date]
      if (typeof storedIng[0] === 'string') {
        return storedIng[0];
      }
      // Handle complex object format
      if (storedIng[0] && typeof storedIng[0] === 'object' && storedIng[0].text && storedIng[0].text.info) {
        return storedIng[0].text.info[0];
      }
    }
    // Handle complex object format directly
    if (storedIng && typeof storedIng === 'object' && storedIng.text && storedIng.text.info) {
      return storedIng.text.info[0];
    }
    return storedIng;
  }

  // Retrieve the list of ingredients the user already tracks,
  // normalized to lower-case trimmed strings.
  function getTrackedIngredientNames() {
    return getUserIngredients()
      .map(ing => extractStoredIngredientName(ing))
      .filter(name => typeof name === 'string' && name.trim())
      .map(name => name.toLowerCase().trim());
  }

  // Retrieve stored ingredients with their original names for display.
  function getStoredIngredients() {
    return getUserIngredients()
      .map(ing => extractStoredIngredientName(ing))
      .filter(name => typeof name === 'string' && name.trim())
      .map(name => name.trim());
  }

  // Convert raw ingredient names into the shopping list format.
  // This removes duplicates, trims whitespace, and sorts alphabetically.
  function buildShoppingItems(names) {
    const sorted = [...new Set(names.filter(Boolean).map(name => name.trim()))]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return sorted.map(name => ({ name, checked: false }));
  }

  // Build the list from saved recipes and exclude ingredients
  // the user already owns. Organize ingredients by recipe.
  function loadShoppingList() {
    const savedRecipes = getSavedRecipes();
    const userIngredientNames = getTrackedIngredientNames();
    const storedIngredients = getStoredIngredients();
    const recipeIngredientsMap = [];

    savedRecipes.forEach(recipe => {
      const recipeIngredients = [];
      const seenIngredients = new Set();

      if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const normalizedIng = normalizeIngredientName(ing);
            const trimmedIng = ing.trim();
            if (normalizedIng && !userIngredientNames.includes(normalizedIng) && !seenIngredients.has(normalizedIng)) {
              recipeIngredients.push({ name: trimmedIng, checked: false });
              seenIngredients.add(normalizedIng);
            }
          }
        });
      } else if (typeof recipe.ingredients === 'string') {
        recipe.ingredients.split(',').forEach(ing => {
          if (ing && typeof ing === 'string') {
            const normalizedIng = normalizeIngredientName(ing);
            const trimmedIng = ing.trim();
            if (normalizedIng && !userIngredientNames.includes(normalizedIng) && !seenIngredients.has(normalizedIng)) {
              recipeIngredients.push({ name: trimmedIng, checked: false });
              seenIngredients.add(normalizedIng);
            }
          }
        });
      }

      // Sort ingredients alphabetically within each recipe
      recipeIngredients.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      if (recipeIngredients.length > 0) {
        recipeIngredientsMap.push({
          title: recipe.title || 'Unnamed Recipe',
          ingredients: recipeIngredients
        });
      }
    });

    setShoppingItems(recipeIngredientsMap);
    setHomeItems(buildShoppingItems(storedIngredients));
    setShoppingLoaded(true);
  }

  // Toggle the checked state for an ingredient in a specific recipe.
  // This updates the local component state immutably.
  function toggleShoppingItem(recipeIndex, ingredientIndex) {
    setShoppingItems(prev => {
      const next = [...prev];
      next[recipeIndex] = { ...next[recipeIndex] };
      next[recipeIndex].ingredients = [...next[recipeIndex].ingredients];
      next[recipeIndex].ingredients[ingredientIndex] = {
        ...next[recipeIndex].ingredients[ingredientIndex],
        checked: !next[recipeIndex].ingredients[ingredientIndex].checked
      };
      return next;
    });
  }

  return (
    <div className="shopping-panel">
      <div className="shopping-panel-actions">
        <h3 style={{ color:'#ffffff' }}>Shopping List</h3>
        <button className='button' onClick={loadShoppingList}>Generate</button>
      </div>

      <div className="shopping-items">
        {!shoppingLoaded && <p>Click the button or open this tab to load the shopping list.</p>}
        
        {shoppingLoaded && shoppingItems.length === 0 && homeItems.length === 0 && <p>No ingredients found. You'll need to save recipes or add ingredients to get started.</p>}

        {/* Section: Items to Buy */}
        {shoppingLoaded && shoppingItems.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Ingredients You Might Need to Buy</h4>
            {shoppingItems.map((recipe, recipeIndex) => (
              <div key={recipeIndex} style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid #555' }}>
                <h5 style={{ color: '#90EE90', marginBottom: '8px', marginTop: 0 }}>{recipe.title}</h5>
                <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
                  {recipe.ingredients.map((item, ingredientIndex) => (
                    <li key={`${recipe.title}-${item.name}-${ingredientIndex}`} style={{ marginBottom: '6px' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleShoppingItem(recipeIndex, ingredientIndex)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                          {item.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Section: Already Have at Home */}
        {shoppingLoaded && homeItems.length > 0 && (
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Ingredients You May Already Have at Home</h4>
            <ul style={{ listStyleType: 'none' }}>
              {homeItems.map((item, index) => (
                <li key={`home-${item.name}-${index}`} style={{ marginBottom: '8px', opacity: 0.7 }}>
                  {item.name === 'String' ? (
                    <span style={{ color: '#ff6b6b', fontStyle: 'italic' }}>
                      Log into an account and load your saved list of ingredients
                    </span>
                  ) : (
                    <span style={{ color: '#90EE90' }}>✓ {item.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}