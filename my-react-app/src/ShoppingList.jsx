import { useState } from 'react';
import { getSavedRecipes, getUserIngredients } from './varManager.jsx';

// ShoppingList displays a generated grocery list based on saved recipes.
// It removes ingredients the user already has at home and shows those home
// ingredients separately for reference while shopping.
export function ShoppingList({ recipes }) {
  // shoppingItems stores ingredients the user may need to buy.
  // The data is grouped by recipe so the user can see which recipe needs each item.
  const [shoppingItems, setShoppingItems] = useState([]);

  // homeItems stores ingredients the user already has at home.
  // These are shown for reference below the shopping list.
  const [homeItems, setHomeItems] = useState([]);

  // shoppingLoaded tracks whether the Generate button has been clicked.
  // This lets the component show a helpful message before any list is generated.
  const [shoppingLoaded, setShoppingLoaded] = useState(false);

  // Generate the shopping list from saved recipes and saved user ingredients.
  function loadShoppingList() {
    // Use recipes passed into the component if available.
    // Otherwise, fall back to recipes saved in varManager.jsx.
    const savedRecipes = Array.isArray(recipes) && recipes.length > 0
      ? recipes
      : getSavedRecipes();

    // Get the user's home ingredients in two forms:
    // 1. A Set of normalized names for fast comparison.
    // 2. A display list for showing the original names on screen.
    const ownedIngredientNames = getTrackedIngredientNames();
    const storedIngredients = getStoredIngredients();

    // Build the ingredients needed for each saved recipe.
    // Empty recipes are filtered out so only useful recipe sections appear.
    const recipeIngredientsMap = savedRecipes
      .map(recipe => buildRecipeShoppingItems(recipe, ownedIngredientNames))
      .filter(recipe => recipe.ingredients.length > 0);

    // Save the generated shopping list and home ingredient list in state.
    setShoppingItems(recipeIngredientsMap);
    setHomeItems(buildShoppingItems(storedIngredients));
    setShoppingLoaded(true);
  }

  // Toggle the checked state for one ingredient in one recipe.
  // This uses immutable updates so React can correctly re-render the component.
  function toggleShoppingItem(recipeIndex, ingredientIndex) {
    setShoppingItems(prevItems =>
      prevItems.map((recipe, currentRecipeIndex) => {
        if (currentRecipeIndex !== recipeIndex) {
          return recipe;
        }

        return {
          ...recipe,
          ingredients: recipe.ingredients.map((ingredient, currentIngredientIndex) => {
            if (currentIngredientIndex !== ingredientIndex) {
              return ingredient;
            }

            return {
              ...ingredient,
              checked: !ingredient.checked
            };
          })
        };
      })
    );
  }

  return (
    <div className="shopping-panel">
      <div className="shopping-panel-actions">
        <h3 style={{ color: '#ffffff' }}>Shopping List</h3>
        <button className="button" onClick={loadShoppingList}>Generate</button>
      </div>

      <div className="shopping-items">
        {!shoppingLoaded && (
          <p>Click the button or open this tab to load the shopping list.</p>
        )}

        {shoppingLoaded && shoppingItems.length === 0 && (
          <p>No saved recipes found. Save some recipes to generate a shopping list!</p>
        )}

        {shoppingLoaded && shoppingItems.length > 0 && (
          <RecipeShoppingSection
            shoppingItems={shoppingItems}
            toggleShoppingItem={toggleShoppingItem}
          />
        )}

        {shoppingLoaded && homeItems.length > 0 && (
          <HomeItemsSection homeItems={homeItems} />
        )}
      </div>
    </div>
  );
}

// RecipeShoppingSection renders the ingredients the user may need to buy.
// Each recipe gets its own section, and each ingredient can be checked off.
function RecipeShoppingSection({ shoppingItems, toggleShoppingItem }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>
        Ingredients You Might Need to Buy
      </h4>

      {shoppingItems.map((recipe, recipeIndex) => (
        <div
          key={`${recipe.title}-${recipeIndex}`}
          style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid #555' }}
        >
          <h5 style={{ color: '#90EE90', marginBottom: '8px', marginTop: 0 }}>
            {recipe.title}
          </h5>

          <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
            {recipe.ingredients.map((item, ingredientIndex) => (
              <li
                key={`${recipe.title}-${item.name}-${ingredientIndex}`}
                style={{ marginBottom: '6px' }}
              >
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
  );
}

// HomeItemsSection renders ingredients that the user already has at home.
// This helps the user avoid buying duplicate ingredients.
function HomeItemsSection({ homeItems }) {
  return (
    <div>
      <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>
        Ingredients You May Already Have at Home
      </h4>

      <ul style={{ listStyleType: 'none' }}>
        {homeItems.map((item, index) => (
          <li
            key={`home-${item.name}-${index}`}
            style={{ marginBottom: '8px', opacity: 0.7 }}
          >
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
  );
}

// Normalize an ingredient name for comparisons.
// Lowercasing and trimming makes "Milk", " milk ", and "MILK" match.
function normalizeIngredientName(ingredient) {
  return typeof ingredient === 'string' ? ingredient.toLowerCase().trim() : '';
}

// Clean an ingredient name for display.
// This keeps the original capitalization but removes extra spaces.
function cleanIngredientName(ingredient) {
  return typeof ingredient === 'string' ? ingredient.trim() : '';
}

// Extract the ingredient name from the different formats used by saved data.
// Supported formats:
// 1. String format: "milk"
// 2. Simple array format: ["milk", "1 gallon", "2026-05-20"]
// 3. Nested object format: { text: { info: ["milk", "1 gallon", "2026-05-20"] } }
// 4. Array containing the nested object format.
function extractStoredIngredientName(storedIngredient) {
  if (typeof storedIngredient === 'string') {
    return storedIngredient.trim();
  }

  if (Array.isArray(storedIngredient) && storedIngredient.length > 0) {
    return extractStoredIngredientName(storedIngredient[0]);
  }

  const nestedName = storedIngredient?.text?.info?.[0];

  if (typeof nestedName === 'string') {
    return nestedName.trim();
  }

  return '';
}

// Get the user's saved ingredients as normalized names.
// A Set is used so checking whether the user owns an ingredient is fast and clear.
function getTrackedIngredientNames() {
  return new Set(
    getUserIngredients()
      .map(ingredient => extractStoredIngredientName(ingredient))
      .map(name => normalizeIngredientName(name))
      .filter(Boolean)
  );
}

// Get the user's saved ingredients as display names.
// These names are used in the "already have at home" section.
function getStoredIngredients() {
  return getUserIngredients()
    .map(ingredient => extractStoredIngredientName(ingredient))
    .map(name => cleanIngredientName(name))
    .filter(Boolean);
}

// Convert recipe ingredients into one consistent array format.
// Recipes may store ingredients as an array or as a comma-separated string.
function getRecipeIngredientList(ingredients) {
  if (Array.isArray(ingredients)) {
    return ingredients;
  }

  if (typeof ingredients === 'string') {
    return ingredients.split(',');
  }

  return [];
}

// Decide whether an ingredient should be added to a recipe shopping section.
// The ingredient is skipped if it is empty, already owned, or already listed
// in the same recipe.
function shouldAddIngredient(name, ownedIngredients, seenIngredients) {
  const normalizedName = normalizeIngredientName(name);

  if (!normalizedName) {
    return false;
  }

  if (ownedIngredients.has(normalizedName)) {
    return false;
  }

  if (seenIngredients.has(normalizedName)) {
    return false;
  }

  seenIngredients.add(normalizedName);
  return true;
}

// Build a clean shopping-list section for a single recipe.
// This removes ingredients the user already owns, removes duplicates inside
// the recipe, sorts the ingredients alphabetically, and adds checkbox state.
function buildRecipeShoppingItems(recipe, ownedIngredients) {
  const seenIngredients = new Set();

  const ingredients = getRecipeIngredientList(recipe?.ingredients)
    .map(ingredient => cleanIngredientName(ingredient))
    .filter(name => shouldAddIngredient(name, ownedIngredients, seenIngredients))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .map(name => ({ name, checked: false }));

  return {
    title: cleanRecipeTitle(recipe?.title),
    ingredients
  };
}

// Create a clean title for a recipe section.
// If a recipe has no title, use a default title instead.
function cleanRecipeTitle(title) {
  if (typeof title === 'string' && title.trim()) {
    return title.trim();
  }

  return 'Unnamed Recipe';
}

// Build a clean list of home ingredients for display.
// This removes blanks, removes duplicates, sorts alphabetically, and adds
// the same object shape used by the shopping-list checkboxes.
function buildShoppingItems(names) {
  const ingredientMap = new Map();

  names.forEach(name => {
    const displayName = cleanIngredientName(name);
    const normalizedName = normalizeIngredientName(displayName);

    if (displayName && normalizedName && !ingredientMap.has(normalizedName)) {
      ingredientMap.set(normalizedName, displayName);
    }
  });

  return [...ingredientMap.values()]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .map(name => ({ name, checked: false }));
}