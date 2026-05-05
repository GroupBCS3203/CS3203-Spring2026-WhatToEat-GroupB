import { useState, useEffect } from 'react'
import { Button } from './App';
import { setUserIngredients, getUserIngredients } from './varManager.jsx';
import {getUID} from "./varManager.jsx";




export function Ingredients(){
    //react hook that holds the ingredents list
    const [ingredients, setIngredients] = useState([]);

    //Updates the global user ingredents list to be consistant with the display
    function updateIngredients(){
        var temp = [];
        console.log(ingredients);
        for(let i = 0; i < ingredients.length; i++){
            temp.push([ingredients[i].text.info[0],ingredients[i].text.info[1],ingredients[i].text.info[2]]);
        }
        setUserIngredients(temp);
        console.log("user ingredients");
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

        if(ingredient.value.split(",").length > 1){
            alert("Please do not include special characters or commas");
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
        if(getUID() == "none"){
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