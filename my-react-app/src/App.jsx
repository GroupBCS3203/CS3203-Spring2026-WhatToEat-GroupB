import { useState, useEffect } from 'react'
import './App.css'




function Button({ onClick, children }) {
  return (
    <button className='button' onClick={onClick}>
      {children}
    </button>
  );
}

function Tabbutton({ feature, onOpen }) {

  function handlePlayClick() {
    var i, tabcontent;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    document.getElementById(feature).style.display = "block";

    if (onOpen) {
      onOpen(feature);
    }
  }
  return (
    <Button onClick={handlePlayClick}>
      {feature}
    </Button>
  );
}



function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shoppingItems, setShoppingItems] = useState([]);
  const [shoppingLoaded, setShoppingLoaded] = useState(false);
  const [ingredients, setIngredients] = useState([]);

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

  function loadShoppingList() {
    const recipesToUse = recipes.length > 0 ? recipes : [];
    const ingredientSet = new Set();
    
    recipesToUse.forEach(recipe => {
      if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            ingredientSet.add(ing.trim());
          }
        });
      } else if (typeof recipe.ingredients === 'string') {
        recipe.ingredients.split(',').forEach(ing => {
          if (ing) ingredientSet.add(ing.trim());
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

  function Ingredientrow(){
        return(
            <tr><td> {ingredients[0]} </td><td>placeholder</td><td>placeholder</td></tr>
        );
}
function addIngredient(){
    var ingredient = document.getElementById("ingredient_input");
    var amount = document.getElementById("amount_input");
    var expiration = document.getElementById("expiration_input");

    var info = [ingredient.value, amount.value, expiration.value];
    setIngredients(info);
}
function removeIngredient(){

}
var numIngredients = 0;

  return (
    <>
      <div className="tab">
          <Tabbutton feature = "recipes" />
          <Tabbutton feature = "login" />
          <Tabbutton feature = "planner" />
          <Tabbutton feature = "budget" />
          <Tabbutton feature = "shopping-list" onOpen={loadShoppingList} />
          <Tabbutton feature = "ingredients" /> 
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
                  <p key={recipe._id || recipe.title}>{recipe.title}</p>
              ))
          )}
        </div>

        <div id="login" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Login
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
 
        <div id="shopping-list" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <div className="shopping-panel">
            <div className="shopping-panel-actions">
              <h3 style={{ color:'#ffffff' }}>Shopping List</h3>
              <Button onClick={loadShoppingList}>Generate from Current Recipes</Button>
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
        </div>

        <div id="ingredients" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Ingredient Tracker
          </h3>
          <table id= "ingredientTable">
            <tbody>
            <tr>
                <th>Ingredient</th><th>Amount</th><th>Expiration date</th><th>Add</th><th>Remove</th>
            </tr>
            <tr>
                <td> <input id = "ingredient_input"
                            type="text"
                            placeholder="Ingredient name"
                            onChange={handleInputChange}
                            />
                </td> 
                <td><input id = "amount_input"
                            type="number"
                            placeholder="Amount of the ingredient"
                            onChange={handleInputChange} // Attach the onChange event handler
                            />
                </td> 
                <td><input id = "expiration_input"
                            type="date"
                            placeholder="Expiration date of the ingredient"
                            onChange={handleInputChange} // Attach the onChange event handler
                            />
                </td>
                <td><Button onClick={() => addIngredient()}>
                        Add to ingredient list
                    </Button>
                </td>
            </tr>
            {ingredients.length === 0 ? (
                <tr><td>enter some ingredients</td></tr>
            ) : (
                <Ingredientrow key={numIngredients++} /> //creates a row by only updates after that. 
            )}
            </tbody>
          </table>
          
        </div>
    </>
  )


  

}

export default App
