import { useState } from 'react'
import './App.css'
import {Ingredients} from './ingredents.jsx'
import LoginRegister from './LoginRegister.jsx'
import { ShoppingList } from './ShoppingList.jsx'
import { MealPlanner } from './MealPlanner.jsx';
import {RecipeFinder} from "./recipeFinder.jsx";
import {DietaryFilter} from "./dietaryFilter.jsx";
import { getUID } from "./varManager.jsx";

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
  const [recipes] = useState([]);
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState(null);
  const [currentUID, setCurrentUID] = useState(getUID());



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
          <a href="https://sooners-my.sharepoint.com/:w:/g/personal/mhouston_ou_edu/IQBPBSeMG4lyRZ7IThFpwP7WAXuECP4D30NALbezmJQvZT4?e=dvYIak" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>Instruction Manual</a>
        </div>

    </>
  )


  

}

export default App
