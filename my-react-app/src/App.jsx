import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useRef } from "react";


function Button({ onClick, children }) {
  return (
    <button className='button' onClick={onClick}>
      {children}
    </button>
  );
}


function Tabbutton({ feature }) {

  function handlePlayClick() {
    var i, tabcontent;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
       document.getElementById(feature).style.display = "block";
  }

  return (
    <Button onClick={handlePlayClick}>
     {feature}
    </Button>
  );
}


function App() {

  function openFeature(feature) {
      
       
    }
    

  const [count, setCount] = useState(0)

  return (
    <>
      


      <div className="tab">
          <Tabbutton feature = "recipes" />
          <Tabbutton feature = "login" />
          <Tabbutton feature = "Planner" />
          <Tabbutton feature = "Banter" />
        </div>

        <div id="recipes" className="tabcontent" style={{display: "block"}}>
          <h3>Recipe Browser</h3>
          <p>placeholder.</p>
        </div>

        <div id="login" className="tabcontent" style={{display: "none"}}>
          <h3>Login</h3>
          <p>placeholder.</p>
        </div>

        <div id="planner" className="tabcontent" style={{display: "none"}}>
          <h3>Meal Planner</h3>
          <p>placeholder.</p>
        </div>

        <div id="budget" className="tabcontent" style={{display: "none"}}>
          <h3>budget Tracker</h3>
          <p>placeholder.</p>
        </div>
    </>
  )


  

}

export default App
