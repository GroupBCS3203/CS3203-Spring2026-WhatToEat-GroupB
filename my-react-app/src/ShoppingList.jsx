import { useState } from 'react';
import { getSavedRecipes, getUserIngredients } from './varManager.jsx';

export function ShoppingList({ recipes }) {
  const [shoppingItems, setShoppingItems] = useState([]);
  const [shoppingLoaded, setShoppingLoaded] = useState(false);

  function loadShoppingList() {
    const savedRecipes = getSavedRecipes();
    const userIngredients = getUserIngredients();
    const userIngredientNames = userIngredients.map(ing => ing.text.info[0].toLowerCase().trim());

    const ingredientSet = new Set();
    
    savedRecipes.forEach(recipe => {
      if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const normalizedIng = ing.toLowerCase().trim();
            if (!userIngredientNames.includes(normalizedIng)) {
              ingredientSet.add(ing.trim());
            }
          }
        });
      } else if (typeof recipe.ingredients === 'string') {
        recipe.ingredients.split(',').forEach(ing => {
          if (ing) {
            const normalizedIng = ing.toLowerCase().trim();
            if (!userIngredientNames.includes(normalizedIng)) {
              ingredientSet.add(ing.trim());
            }
          }
        });
      }
    });

    const sorted = [...ingredientSet]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    setShoppingItems(sorted.map(name => ({ name, checked: false })));
    setShoppingLoaded(true);
  }

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
        <button className='button' onClick={loadShoppingList}>Generate from Saved Recipes</button>
      </div>

      <div className="shopping-items">
        {!shoppingLoaded && <p>Click the button or open this tab to load the shopping list.</p>}
        {shoppingLoaded && shoppingItems.length === 0 && <p>No ingredients found.</p>}

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