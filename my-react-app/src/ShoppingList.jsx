import { useState } from 'react';
import { getSavedRecipes, getUserIngredients } from './varManager.jsx';

// ShoppingList displays ingredients that are needed for saved recipes.
// It ignores ingredients the user already has and supports recipe data
// stored as arrays or comma-separated strings.
export function ShoppingList({ recipes }) {
  // shoppingItems stores the list of ingredients with checked state.
  const [shoppingItems, setShoppingItems] = useState([]);
  // shoppingLoaded is used to determine whether the list has been generated.
  const [shoppingLoaded, setShoppingLoaded] = useState(false);

  // Normalize ingredient values for comparison.
  // This is important for deduplication and user-stock filtering.
  function normalizeIngredientName(ingredient) {
    return typeof ingredient === 'string' ? ingredient.toLowerCase().trim() : '';
  }

  // Retrieve the list of ingredients the user already tracks,
  // normalized to lower-case trimmed strings.
  function getTrackedIngredientNames() {
    return getUserIngredients()
      .map(ing => ing?.text?.info?.[0])
      .filter(name => typeof name === 'string' && name.trim())
      .map(name => name.toLowerCase().trim());
  }

  // Convert raw ingredient names into the shopping list format.
  // This removes duplicates, trims whitespace, and sorts alphabetically.
  function buildShoppingItems(names) {
    const sorted = [...new Set(names.filter(Boolean).map(name => name.trim()))]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return sorted.map(name => ({ name, checked: false }));
  }

  // Build the list from saved recipes and exclude ingredients
  // the user already owns.
  function loadShoppingList() {
    const savedRecipes = getSavedRecipes();
    const userIngredientNames = getTrackedIngredientNames();
    const ingredientSet = new Set();

    savedRecipes.forEach(recipe => {
      if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const normalizedIng = normalizeIngredientName(ing);
            if (normalizedIng && !userIngredientNames.includes(normalizedIng)) {
              ingredientSet.add(ing.trim());
            }
          }
        });
      } else if (typeof recipe.ingredients === 'string') {
        recipe.ingredients.split(',').forEach(ing => {
          if (ing && typeof ing === 'string') {
            const normalizedIng = normalizeIngredientName(ing);
            if (normalizedIng && !userIngredientNames.includes(normalizedIng)) {
              ingredientSet.add(ing.trim());
            }
          }
        });
      }
    });

    setShoppingItems(buildShoppingItems([...ingredientSet]));
    setShoppingLoaded(true);
  }

  // Toggle the checked state for an individual shopping item.
  // This updates the local component state immutably.
  function toggleShoppingItem(index) {
    setShoppingItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], checked: !next[index].checked };
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
        {shoppingLoaded && shoppingItems.length === 0 && <p>No ingredients found. Check if you have any saved recipes.</p>}

        {shoppingItems.length > 0 && (
          <ul style={{ listStyleType: 'none' }}>
            {shoppingItems.map((item, index) => (
              <li key={`${item.name}-${index}`} style={{ marginBottom: '8px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleShoppingItem(index)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                    {item.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}