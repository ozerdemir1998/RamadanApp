const fetch = require('node-fetch');

const CATEGORIES = [
    "Beef", "Chicken", "Lamb", "Pasta", "Dessert", "Side", "Starter", "Vegan", "Vegetarian", "Seafood"
];

async function getMealsByCategory(cat) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
        const data = await res.json();
        if (data.meals) {
            return data.meals.map(m => m.strMeal);
        }
    } catch (e) {
        console.error(e);
    }
    return [];
}

async function discover() {
    const allMeals = {};

    for (const cat of CATEGORIES) {
        console.log(`Fetching ${cat}...`);
        const meals = await getMealsByCategory(cat);
        allMeals[cat] = meals;
        console.log(`  Found ${meals.length} meals.`);
    }

    console.log("\n--- SUGGESTED MAPPINGS ---");
    // Log a sample to pick from
    console.log(JSON.stringify(allMeals, null, 2));
}

discover();
