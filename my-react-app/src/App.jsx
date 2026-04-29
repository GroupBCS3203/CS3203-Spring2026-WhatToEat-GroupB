import { useState, useEffect } from 'react'
import './App.css'
import {Ingredients} from './ingredents.jsx'
import LoginRegister from './LoginRegister.jsx'

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
