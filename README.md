# WhatToEat
[WhatToEat](https://whattoeat-client.onrender.com/) is the all-in-one food managing program. At its core, WhatToEat is meant to help anyone seeking to figure out home cooking, no matter if their just learning to live on their own or if their fully-settled and kitchen-experienced.

It does this by giving users recipes they can cook based on the ingredients they currently have. WhatToEat is planned to also have meal planning capabilities, an AI-driven recommendation system, and nutrition tracker, all working to make figuring out what to eat easy.

It is important to note that this README mirrors the progress of WhatToEat, so anything that is currently a placeholder will be changed when appropriate.
## Table of Contents
- [Usage](#usage)
- [Local Installation and Testing](#local-installation-and-testing)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Tools](#tools)
- [Contributing](#contributing)
- [Support Contacts](#support-contacts)
- [License](#license)
- [Credits](#credits)

## Usage
The current, work-in-progress website can be accessed using at [https://whattoeat-client.onrender.com/](https://whattoeat-client.onrender.com/). Please note that if our website only displays "Loading", that means the API is currently booting-up, and will need some time. You can look at [local testing](#local-testing) to see how to check the progress of the API boot-up.
## Local Installation and Testing

### Local Installation
To create a local installation of WhatToEat, firstly install [Node.js](https://nodejs.org/en). This is the backbone of our project, and everything requires it.

To clone the repo, use the following git command:

```bash
git clone https://github.com/GroupBCS3203/CS3203-Spring2026-WhatToEat-GroupB.git
```

Next input the following commands into the terminal, the goal is to set the working directory to be `my-react-app`, install dependencies, and build the frontend:

```shell
cd ./CS3203-Spring2026-WhatToEat-GroupB/my-react-app
npm install
npm run build
```
This creates the build so the website can be ran locally using `npm run dev`. **Notably**, you cannot use the backend files as it is unsafe to share the URI for our database. If you whish to connect to our database. Create a `.env` file in the `my-react-app` directory, and put the following in it:

```
VITE_API_URL = "https://whattoeat-api.onrender.com"
```

This will allow you to connect to the api we are running, and do calls of the recipes. **NOTE**: If the "Get 10 Recipes" button still only produces "Loading", go to [this website](https://whattoeat-api.onrender.com/api/recipes/top). This is effectively what is called when you press that button. If it a Render webpage instead of JSON, that means the API is booting up, and needs some time to boot up. Once that webpage returns JSON data, then the API is live.

### Local Testing

Because our backend testing uses direct database calls, they cannot be run by anyone but a main developer. To test the frontend, ensure that your working directory is still `my-react-app` and run the following command:

```shell
npm test
```
This tests to ensure our website can make correct database calls (using mock data to remove the need for the external API to be running) and that these calls are properly displayed.

If you want to see our backend tests, feel free to look at them both in the files at `.\backend\tests\recipeDB.test.js` and in our [Git Hub Actions](https://github.com/GroupBCS3203/CS3203-Spring2026-WhatToEat-GroupB/actions). 

## Current Status
WhatToEat is currently around Phase 1 - Phase 2. Our WIP website can be found in [Usage](#usage). There are currently four phases worth of content planned out for our future development which can be seen in the [Roadmap](#roadmap)
## Roadmap
### Phase 1: Core Project
- **Ingredient Tracker**
	- Keeps track of the ingredients the user current has 
	- Stores the expiration date of each ingredient
- **Recipe Recommender**
	- Scrape and store recipe data from popular recipe sites
	- Based on the ingredients the user has, find recipes they are able to cook
### Phase 2: Additional Core Features
- **Standardized UI**
	- Create a standard UI to give WhatToEat a clean and professional style
- **Accounts**
	- Accounts help store ingredient information and past recipes per user. Also can be used for future informational storage
- **Recommendation AI**
	- Use modern LLMs to recommend users recipes they may enjoy based on their previous recipes and available ingredients
### Phase 3: Meal Planning
- **Meal Planning**
	- Allow the user to create a plan for what they will eat in the near future and recommend recipes for this plan
- **Shopping List**
	- A shopping list based on the meal plan so the user has an easier time cooking recipes they are interested in
### Phase 4: Extra Features
- **Nutrition Tracker**
	- Tracks the macro information of the recipes they cook
	- Helps the user be more nutrition conscious
- **I'm Feeling Lucky**
	- Adds a button where the user is given a recipe based on their current ingredients, allowing them to explore new recipes they may have never thought of
## Tools
- For the frontend, we are using React and Vite
- Both our website and our API are being hosted with Render
- MongoDB is being used to hold and call both ingredient and recipe information
- [This public dataset](https://www.kaggle.com/datasets/wilmerarltstrmberg/recipe-dataset-over-2m/data) is what we will use as a source for our recipes
## Contributing
For anyone looking to help WhatToEat please use the following steps:
1. Fork the repository
2. Create a new branch named after the feature being worked on
3. Update your branch until it is good enough for the main project
4. Push your branch and make a pull request for it to be added
## Support Contacts
The main development team can be reached through their respective discord accounts:
- CarsonHGreen:  superpot8o
- Matbenhou: matbenhou
- zachary-allen823: dechelarson
- JB965: jackbarnes1234567
- Boomerdoom03: boomerdoom
- Hicksn: nightpersona
- DavidPham24: david_pham_1ou
## License
We will likely use the standard MIT License, but this is yet to be decided
## Credits 
### Main Development Team
- Carson Green
- Matthew Houston
- Zachary Allen
- Jack Barnes
- Kaleb Meissner
- Noah Hicks
- David Pham

## CS3203-Spring2026-README-GroupB
