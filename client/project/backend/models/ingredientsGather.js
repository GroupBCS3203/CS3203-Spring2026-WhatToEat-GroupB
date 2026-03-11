const fs = require('fs');
const csv = require('csv-parser');
const results = [];
//get first line of data from csv file and print it out
fs.createReadStream('ingredients.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results[0]);
  });





ingredients = ["1 cup of flour", "2 eggs", "1/2 cup of sugar"];
for(let i = 0; i < ingredients.length; i++) 
    console.log(ingredients[i]);