const fetch = require('node-fetch'); // Ensure node-fetch is available

// The map we are currently using (or planning to use)
const TERMS_TO_TEST = {
    // Çorbalar
    "Mercimek Çorbası": "Lentil Soup",
    "Ezogelin Çorbası": "Lentil Soup",
    "Yayla Çorbası": "Yoghurt Soup", // Check if this exists
    "Domates Çorbası": "Tomato Soup",
    "Tarhana Çorbası": "Soup", // Generic -> Dangerous
    "Düğün Çorbası": "Lamb Soup",
    "Tavuk Suyu Çorbası": "Chicken Soup",
    "Mantar Çorbası": "Mushroom Soup",
    "Şehriye Çorbası": "Noodle Soup",
    "Brokoli Çorbası": "Broccoli Soup",

    // Et
    "İskender Kebap": "Kebab",
    "Hünkar Beğendi": "Lamb", // Generic -> Dangerous
    "İzmir Köfte": "Meatballs",
    "Kuzu İncik": "Lamb", // Generic -> Repetitive
    "Karnıyarık": "Eggplant", // Generic -> Repetitive
    "Ali Nazik": "Kebab",
    "Tas Kebabı": "Beef Stew",

    // Tavuk
    "Tavuk Sote": "Chicken Stir Fry",
    "Tavuk Şinitzel": "Chicken Schnitzel",
    "Köri Soslu Tavuk": "Chicken Curry",
    "Tavuklu Pilav": "Chicken Rice", // Generic?

    // Tatlı
    "Baklava": "Baklava",
    "Sütlaç": "Rice Pudding",
    "Künefe": "Kunafa",
    "Revani": "Semolina",
    "Güllaç": "Pudding",
    "Trileçe": "Tres Leches"
};

async function checkTerm(term) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        const data = await res.json();
        if (data.meals && data.meals.length > 0) {
            // Return key info to detect duplicates
            return {
                found: true,
                mealName: data.meals[0].strMeal,
                thumb: data.meals[0].strMealThumb
            };
        }
    } catch (e) {
        // ignore
    }
    return { found: false };
}

async function verify() {
    console.log("TR Name | Search Term | -> | Actual Meal Found (TheMealDB)");
    console.log("-------------------------------------------------------------");

    const foundMeals = new Set();
    const duplicates = [];

    for (const [tr, term] of Object.entries(TERMS_TO_TEST)) {
        const result = await checkTerm(term);
        if (result.found) {
            const isDup = foundMeals.has(result.mealName);
            if (isDup) duplicates.push(`${tr} (found ${result.mealName})`);

            foundMeals.add(result.mealName);

            console.log(`${tr.padEnd(20)} | ${term.padEnd(15)} | -> | ${result.mealName} ${isDup ? "⚠️ DUP" : "✅"}`);
        } else {
            console.log(`${tr.padEnd(20)} | ${term.padEnd(15)} | -> | ❌ NO RESULT`);
        }
    }
}

verify();
