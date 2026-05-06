import { useState, useEffect } from 'react'
import { Button } from './App';
import { setUserIngredients, getUserIngredients } from './varManager.jsx';
import {getUID} from "./varManager.jsx";




export function Ingredients(){
    
    //react hook that holds the ingredents list
    const [ingredients, setIngredients] = useState([]);
    var numCalls = 0;
    var callTime = Date.now();

    //prevents the user from making too many calls
    function throttle(){
        const COOLDOWN = 3000;
        const MAX_CALLS = 5;
        numCalls++;
        if(Date.now() > callTime + COOLDOWN){
            callTime = Date.now();
            numCalls = 0;
        }
        if(numCalls >= MAX_CALLS){
            return true;
        }
        return false;
    }

    //Updates the global user ingredents list to be consistant with the display
    function updateIngredients(){
        var temp = [];
        console.log(ingredients);
        for(let i = 0; i < ingredients.length; i++){
            temp.push([ingredients[i].text.info[0],ingredients[i].text.info[1],ingredients[i].text.info[2]]);
        }
        setUserIngredients(temp);
        
    }

    //reduces a list of elements to a single string
    function getElements(list, index){
        var output = "";
        for(let i=0; i<list.length; i++ ){
            output = output.concat( list[i].text.info[index], "," );
        }
        return output;
    }

    //Click handler for the add button. Retrives the inputed data and adds it to the list if ingredents.
    function addIngredient(){
        var ingredient = document.getElementById("ingredient_input");
        var amount = document.getElementById("amount_input");
        var expiration = document.getElementById("expiration_input");


        // Ensures the user can only input letters and spaces as ingredients,
        // this prevents the user from being able to input anything that could mess with API calls
        if(/[^A-Za-z\s]/.test(ingredient.value)){
            alert("Please only include letters and spaces in ingredient names");
        }else{
            var info = [ingredient.value, amount.value, expiration.value];
    
            setIngredients([...ingredients, { id: Date.now(), text: {info} }]);
            //updateIngredients();
        }        
    }

    //Click handler for the remove button. Removes the ingredents that is pressed using its ID.
    function removeIngredient(id){
        setIngredients(ingredients.filter(ingredients => ingredients.id !== id));
        //updateIngredients();
    }

    //Loads ingredents from the global ingredent list. Overwrites the current list.
    function loadIngredients(){
            if(getUID() == "none"){
                alert("please login to load saved ingredents");
            }else{
                var newList = getUserIngredients(); 
                var info = [];
                var temp = [];
                setIngredients([]);
                for(let i = 0; i<newList.length; i++){
                    info = [newList[i][0], newList[i][1],  newList[i][2]];
                    temp.push({ id: Date.now()+i, text: {info} });
                }
                setIngredients(temp);
            }
        
    }

    //Saves the current ingredent list to the database.
    function saveIngredients(){
        if(throttle()){
            alert("please wait before making more server requests");
        }else if(getUID() == "none"){
            alert("please login to save ingredents");
        }else{
            const nameList = getElements(ingredients, 0);
            const amountList =  getElements(ingredients, 1);
            const dateList =  getElements(ingredients, 2);
            fetch(`${import.meta.env.VITE_API_URL}/api/user/saveIngredients?userID=${getUID()}&nameList=${nameList}&amountList=${amountList}&dateList=${dateList}`);
            updateIngredients();
        }
    }

    //front end elements
    return (<div>
            <h3 style={{ color:'#ffffff' }}>
            Ingredient Tracker
          </h3>
          <table id= "ingredientTable">
            <tbody>
            <tr>
                <th>Ingredient</th><th>Amount</th><th>Expiration date</th><th>Add/Remove</th><th><Button onClick={()=> saveIngredients()}>Save list</Button></th><th><Button onClick={() => loadIngredients()}>Load list</Button></th>
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
                 <tr key = {ingredients.id} >
                    <td> {ingredients.text.info[0]} </td>
                    <td>{ingredients.text.info[1]}</td>
                    <td>{ingredients.text.info[2]}</td>
                    <td> <Button onClick={() => removeIngredient(ingredients.id)}> remove Ingredient</Button> </td>
                </tr>
                 
                ))
            )}
            </tbody>
          </table>
        </div>
        
    );
}