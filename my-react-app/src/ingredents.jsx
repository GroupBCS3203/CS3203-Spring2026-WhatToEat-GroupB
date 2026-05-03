import { useState, useEffect } from 'react'
import { Button } from './App';





export function Ingredients(){
    function addIngredient(){
        var ingredient = document.getElementById("ingredient_input");
        var amount = document.getElementById("amount_input");
        var expiration = document.getElementById("expiration_input");

        var info = [ingredient.value, amount.value, expiration.value];
    
        setIngredients([...ingredients, { id: Date.now(), text: {info} }]);
    }

    function removeIngredient(id){
    
        setIngredients(ingredients.filter(ingredients => ingredients.id !== id));
    }

    function loadIngredients(){
        console.log(ingredients);
    }

    const [ingredients, setIngredients] = useState([]);

    return (<div>
            <h3 style={{ color:'#ffffff' }}>
            Ingredient Tracker
          </h3>
          <table id= "ingredientTable">
            <tbody>
            <tr>
                <th>Ingredient</th><th>Amount</th><th>Expiration date</th><th>Add/Remove</th><th><Button>Save list</Button></th><th><Button onClick={() => loadIngredients()}>Load list</Button></th>
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