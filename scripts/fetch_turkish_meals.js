const fetch = require('node-fetch');

async function getTurkishMeals() {
    try {
        console.log("Fetching Turkish meals from TheMealDB...");
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=Turkish');
        const data = await res.json();

        if (data.meals) {
            console.log(`Found ${data.meals.length} Turkish meals:`);
            data.meals.forEach(m => {
                console.log(`- ${m.strMeal} (ID: ${m.idMeal})`);
            });
        } else {
            console.log("No Turkish meals found.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

getTurkishMeals();
