const fetch = require('node-fetch');

async function getByCat(cat) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
    const data = await res.json();
    return data.meals ? data.meals.map(m => m.strMeal) : [];
}

async function search(s) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${s}`);
    const data = await res.json();
    return data.meals ? data.meals.map(m => m.strMeal) : [];
}

async function run() {
    const vegs = await getByCat("Vegetarian");
    console.log("--- VEGETARIAN ---");
    console.log(vegs.join("\n"));

    const soups = await search("soup");
    console.log("\n--- SOUPS ---");
    console.log(soups.join("\n"));
}

run();
