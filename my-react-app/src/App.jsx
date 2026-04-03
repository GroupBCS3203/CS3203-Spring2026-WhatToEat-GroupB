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
var numIngredients = 0;


function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shoppingItems, setShoppingItems] = useState([]);
  const [shoppingLoaded, setShoppingLoaded] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState(null);

  const todayKey = new Date().toISOString().split('T')[0];
  const [plannerEvents, setPlannerEvents] = useState({});
  const [plannerDate, setPlannerDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(1);
    return d;
  });
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newPlannerEventDate, setNewPlannerEventDate] = useState(todayKey);
  const [newPlannerEventName, setNewPlannerEventName] = useState('');
  const [newPlannerEventTime, setNewPlannerEventTime] = useState('12:00');

//selects between Login and Register form, changing the state of isLoginMode to determine which form to show
  const [isLoginMode, setIsLoginMode] = useState(true);
  // Login form state variables
  const [loginUsername, setLoginUsername] = useState(''); // username input
  const [loginPassword, setLoginPassword] = useState(''); // password input
  const [loginError, setLoginError] = useState(''); // login validation/error message
  const [loginLoading, setLoginLoading] = useState(false); // login form loading spinner
  // Register form state variables
  const [registerUsername, setRegisterUsername] = useState(''); // register username input
  const [registerPassword, setRegisterPassword] = useState(''); // register password input
  const [confirmPassword, setConfirmPassword] = useState(''); // confirm password input
  const [registerError, setRegisterError] = useState(''); // register validation/error message
  const [registerLoading, setRegisterLoading] = useState(false); // register form loading spinner

  const [veganOnly, setVeganOnly] = useState(false);

  // Format date as YYYY-MM-DD for planner dates.
  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  function getCalendarGrid() {
    const year = plannerDate.getFullYear();
    const month = plannerDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startIndex = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startIndex + 1;
      if (i < startIndex || dayNum > daysInMonth) {
        grid.push(null);
      } else {
        grid.push(new Date(year, month, dayNum));
      }
    }

    return grid;
  }

  function handleAddPlannerEvent() {
    if (!newPlannerEventName.trim()) {
      return;
    }

    const dateKey = newPlannerEventDate;
    const event = {
      id: `${dateKey}-${Date.now()}`,
      name: newPlannerEventName.trim(),
      time: newPlannerEventTime,
    };

    setPlannerEvents(prev => {
      const existing = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...existing, event],
      };
    });

    setIsAddEventOpen(false);
    setNewPlannerEventName('');
    setNewPlannerEventTime('12:00');
  }

  function prevMonth() {
    const d = new Date(plannerDate);
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    setPlannerDate(d);
  }

  function nextMonth() {
    const d = new Date(plannerDate);
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    setPlannerDate(d);
  }

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recipes/top`)
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error(err));
  }, []);

  // POST-form login handler for authentication.
  // On submit, validate fields, set loading, and execute REST call placeholder logic.
  // Replace mock code with API integration (e.g., fetch('/api/auth/login')).
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }

    setLoginLoading(true);
    try {
      // TODO: implement login API/database call and handle response
      console.log('Login attempt:', { username: loginUsername, password: loginPassword });

      // Simulated delay for UI behavior
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: handle successful login (e.g. store auth token, update user context, redirect)
      alert('Login successful');
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // POST-form registration handler.
  // Validates fields for presence, match, and length; then calls placeholder async logic.
  // Replace with actual save-user endpoint and proper error mapping.
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerUsername || !registerPassword || !confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    setRegisterLoading(true);
    try {
      // TODO: implement register API/database call and handle response
      console.log('Register attempt:', { username: registerUsername, password: registerPassword });

      // Simulated delay for UI behavior
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: handle successful register (e.g. store auth token, update user context, redirect)
      alert('Registration successful');
    } catch {
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

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


function addIngredient(){
    var ingredient = document.getElementById("ingredient_input");
    var amount = document.getElementById("amount_input");
    var expiration = document.getElementById("expiration_input");

    var info = [ingredient.value, amount.value, expiration.value];
    numIngredients++;
   
    setIngredients([...ingredients, { id: {numIngredients}, text: {info} }]);

    
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
          <h3 style={{ color:'#ffffff' }}>
            Login
          </h3>
          {/* Tabs to switch the login/register form */}
          <div style={{ marginBottom: '20px' }}>
  <button
    onClick={() => setIsLoginMode(true)}
    style={{
      padding: '10px 20px',
      marginRight: '10px',
      borderRadius: '4px',
      border: 'none',
      background: isLoginMode ? '#4CAF50' : '#666',
      color: '#fff',
      cursor: 'pointer'
    }}
  >
    Login
  </button>
  <button
    onClick={() => setIsLoginMode(false)}
    style={{
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      background: !isLoginMode ? '#2196F3' : '#666',
      color: '#fff',
      cursor: 'pointer'
    }}
  >
    Register
  </button>
</div>

        {isLoginMode ? (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <h4 style={{ color: '#ffffff' }}>Login Form</h4>
            <form onSubmit={handleLoginSubmit}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                Username
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                  disabled={loginLoading}
                />
              </label>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                  disabled={loginLoading}
                />
              </label>
              {loginError && <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>{loginError}</div>}
              <button
                type="submit"
                disabled={loginLoading}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: '#4CAF50', color: '#fff' }}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <h4 style={{ color: '#ffffff' }}>Register Form</h4>
            <form onSubmit={handleRegisterSubmit}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                Username
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                  disabled={registerLoading}
                />
              </label>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                Password
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                  disabled={registerLoading}
                />
              </label>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                  disabled={registerLoading}
                />
              </label>
              {registerError && <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>{registerError}</div>}
              <button
                type="submit"
                disabled={registerLoading}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: '#2196F3', color: '#fff' }}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        )}

        </div>

        <div id="planner" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button onClick={prevMonth}>◀</Button>
              <strong style={{ color: '#ffffff', fontSize: '18px' }}>{plannerDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
              <Button onClick={nextMonth}>▶</Button>
            </div>

            <Button onClick={() => setIsAddEventOpen(prev => !prev)}>
              {isAddEventOpen ? 'Close Event' : 'Create Event'}
            </Button>
          </div>

          {isAddEventOpen && (
            <div className="planner-event-form" style={{ marginBottom: '12px', background: '#1b1b1b', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Event Date
                  <input
                    type="date"
                    value={newPlannerEventDate}
                    onChange={e => setNewPlannerEventDate(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Food name
                  <input
                    type="text"
                    placeholder="Food name"
                    value={newPlannerEventName}
                    onChange={e => setNewPlannerEventName(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <label style={{ color: '#fff', fontSize: '14px' }}>
                  Time
                  <input
                    type="time"
                    value={newPlannerEventTime}
                    onChange={e => setNewPlannerEventTime(e.target.value)}
                    style={{ marginLeft: '4px', padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  />
                </label>

                <Button onClick={handleAddPlannerEvent}>Save</Button>
              </div>
            </div>
          )}

          <div className="planner-calendar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ color: '#fff', fontWeight: 'bold' }}>{d}</div>
            ))}

            {getCalendarGrid().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: '90px', background: '#2b2b2b', borderRadius: '6px' }} />;
              }

              const dayKey = formatDate(date);
              const events = plannerEvents[dayKey] || [];
              const isToday = dayKey === todayKey;

              return (
                <div
                  key={dayKey}
                  style={{
                    minHeight: '90px',
                    background: isToday ? '#3272d9' : '#2b2b2b',
                    borderRadius: '6px',
                    padding: '5px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setIsAddEventOpen(true);
                    setNewPlannerEventDate(dayKey);
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{date.getDate()}</div>
                  {events.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ fontSize: '11px', marginBottom: '2px', textAlign: 'left' }}>
                      {ev.time} {ev.name}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div style={{ fontSize: '10px', opacity: 0.8, textAlign: 'left' }}>+{events.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>
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
          <h3 style={{ color:'#ffffff' }}>
            Ingredient Tracker
          </h3>
          <table id= "ingredientTable">
            <tbody>
            <tr>
                <th>Ingredient</th><th>Amount</th><th>Expiration date</th><th>Add</th>
            </tr>
            <tr>
                <td> <input id = "ingredient_input"
                            type="text"
                            placeholder="Ingredient name"
                            />
                </td> 
                <td><input id = "amount_input"
                            type="number"
                            placeholder="Amount of the ingredient"
                            />
                </td> 
                <td><input id = "expiration_input"
                            type="date"
                            placeholder="Expiration date of the ingredient"
                            />
                </td>
                <td><Button onClick={() => addIngredient()}>
                        Add to ingredient list
                    </Button>
                </td>
            </tr>
            {ingredients.length === 0 ? (
                <tr><td>enter some ingredients</td></tr>
            ) : (ingredients.map(ingredients => (
                 <tr key = {ingredients.id}>
                    <td> {ingredients.text.info[0]} </td>
                    <td>{ingredients.text.info[1]}</td>
                    <td>{ingredients.text.info[2]}</td>
                    <td>remove button placeholder</td>
                </tr>
                 
                ))
            )}
            </tbody>
          </table>
          
        </div>
      <div id="diet-filter" className="tabcontent" style={{ color:'#ffffff', display: "block"}}>
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
