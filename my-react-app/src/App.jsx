import { useState, useEffect } from 'react'
import './App.css'
import {Ingredients} from './ingredents.jsx'
import LoginRegister from './LoginRegister.jsx'
import { MealPlanner } from './MealPlanner.jsx';

export function Button({ onClick, children }) {
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
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState(null);

  
  const [veganOnly, setVeganOnly] = useState(false);


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



function calculateBudget(income) {
  return income * 0.15; 
}

function handleCalculate(){
  const numericIncome = parseFloat(income);
  if (!isNaN(numericIncome) && numericIncome > 0) {
    setBudget(calculateBudget(numericIncome));
  }
}

  return (
    <>
      <div className="tab">
          <Tabbutton feature = "recipes" />
          <Tabbutton feature = "login" />
          <Tabbutton feature = "planner" />
          <Tabbutton feature = "budget" />
          <Tabbutton feature = "shopping-list" onOpen={loadShoppingList} />
          <Tabbutton feature = "ingredients" />
          <Tabbutton feature = "diet-filter" />
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
          <LoginRegister />
        </div>

        <div id="planner" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <MealPlanner />
        </div>

        <div id="budget" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <h3 style={{ color:'#ffffff' }}>
            Budget Tracker
          </h3>
          <input
            type="number"
            placeholder="Enter monthly income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <Button onClick={handleCalculate}>
            Calculate Budget
          </Button>
          {budget !== null && (
            <p>Your budget: ${budget.toFixed(2)} </p>
          )}
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
          <Ingredients></Ingredients>
        </div>
      <div id="diet-filter" className="tabcontent" style={{ color:'#ffffff', display: "none"}}>
        <h3 style={{ color:'#ffffff' }}>
          Dietary Restrictions (Currently in testing)
        </h3>
        <label>
          <input
              type="checkbox"
              checked={veganOnly}
              onChange={(e) => setVeganOnly(e.target.checked)}
          />
          Vegan Only
        </label>
      </div>
    </>
  )


  

}

export default App
