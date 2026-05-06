import { useState } from 'react'
import './App.css'
import {Ingredients} from './ingredents.jsx'
import LoginRegister from './LoginRegister.jsx'
import { ShoppingList } from './ShoppingList.jsx'
import { MealPlanner } from './MealPlanner.jsx';
import {RecipeFinder} from "./recipeFinder.jsx";
import {DietaryFilter} from "./dietaryFilter.jsx";
import { getUID } from "./varManager.jsx";

// Basic button model
export function Button({ onClick, children, style, className }) {
  return (
    <button className={className || 'button'} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// handles the tab button functionality, where clicking a tab will display different content
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

// app function that defines the structure of the website (like the different tabs and the header/footer)
function App() {
  const [recipes] = useState([]);
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState(null);
  const [currentUID, setCurrentUID] = useState(getUID());



// calculates monthly food budget based on income, doesn't have it's own file because it is so small
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
      <header className="app-header">
        <img src="/logo.png" alt="WhatToEat logo" className="app-logo" />
      </header>

      <div className="tab">
          <Tabbutton feature = "recipes" />
          <Tabbutton feature = "login" />
          <Tabbutton feature = "planner" />
          <Tabbutton feature = "budget" />
          <Tabbutton feature = "shopping-list" />
          <Tabbutton feature = "ingredients" />
          <Tabbutton feature = "diet-filter" />
          <span
            style={{
              float: 'right',
              margin: '8px 12px 0 0',
              padding: '6px 10px',
              borderRadius: '4px',
              border: currentUID !== 'none' ? '1px solid #4CAF50' : '1px solid #666',
              background: currentUID !== 'none' ? '#173d1a' : '#252525',
              color: '#fff',
              fontSize: '14px'
            }}
          >
            {currentUID !== 'none' ? 'Logged in' : 'Not logged in'}
          </span>
        </div>

        <div id="recipes" className="tabcontent" style={{ color:'#ffffff', display: "block"}}>
          <RecipeFinder/>
        </div>

        <div id="login" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <LoginRegister onLoginChange={setCurrentUID} />
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
          <ShoppingList recipes={recipes} />
        </div>

        <div id="ingredients" className="tabcontent" style={{color:'#ffffff',display: "none"}}>
          <Ingredients></Ingredients>
        </div>

        <div id="diet-filter" className="tabcontent" style={{color: '#ffffff', display: "none"}}>
            <DietaryFilter></DietaryFilter>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="https://github.com/GroupBCS3203/CS3203-Spring2026-WhatToEat-GroupB/blob/main/GroupB_Ticket5Sprint2InstructionManual_CS3203Spring2026-2.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>Instruction Manual</a>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="https://github.com/GroupBCS3203/CS3203-Spring2026-WhatToEat-GroupB/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>GitHub</a>
        </div>

    </>
  )


  

}

export default App
