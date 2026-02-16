const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch if Node 18+

// Proposed mappings to test
const CANDIDATES = {
    "Mercimek Çorbası": ["Lentil", "Lentil Soup", "Soup"],
    "Ezogelin Çorbası": ["Turkish Lentil", "Lentil", "Soup"],
    "Yayla Çorbası": ["Yoghurt Soup", "Cream Soup"],
    "Domates Çorbası": ["Tomato Soup", "Tomato"],
    "Tarhana Çorbası": ["Soup"],
    "İskender Kebap": ["Kebab", "Doner", "Shawarma"],
    "Hünkar Beğendi": ["Lamb", "Creamy Polenta"], // Hard one
    "Karnıyarık": ["Eggplant", "Moussaka", "Stuffed Eggplant"],
    "Tavuk Sote": ["Chicken Stir Fry", "Chicken"],
    "Tavuk Şinitzel": ["Schnitzel", "Chicken Schnitzel"],
    "Köri Soslu Tavuk": ["Chicken Curry", "Curry"],
    "Baklava": ["Baklava"],
    "Sütlaç": ["Rice Pudding", "Pudding"],
    "Künefe": ["Kunafa", "Pancake"], // Kunafa might not exist
    "Revani": ["Semolina", "Cake", "Sponge Cake"],
    "Güllaç": ["Dessert", "Pudding"],
    "Lahmacun": ["Pizza", "Turkish Pizza"],
    "Pide": ["Pizza"],
    "Köfte": ["Meatballs", "Kofta"],
    "Dolma": ["Stuffed", "Dolma"],
    "Sarma": ["Dolma", "Stuffed Vine Leaves"],
    "Börek": ["Burek", "Pie", "Spring Rolls"],
    "Menemen": ["Shakshuka", "Scrambled Eggs"],
    "Mantı": ["Ravioli", "Dumplings", "Manti"],
    "Pilav": ["Rice", "Pilaf"],
    "Cacık": ["Tzatziki", "Yogurt"],
    "Salata": ["Salad", "Greek Salad"],
    "Kısır": ["Tabbouleh", "Salad"],
    "Mücver": ["Fritters", "Zucchini"],
    "İmam Bayıldı": ["Eggplant", "Ratatouille"]
};

async function checkTerm(term) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        const data = await res.json();
        return data.meals && data.meals.length > 0 ? data.meals[0].strMealThumb : null;
    } catch (e) {
        return null;
    }
}

async function verify() {
    const results = {};

    for (const [tr, terms] of Object.entries(CANDIDATES)) {
        console.log(`Checking for: ${tr}`);
        let found = false;
        for (const term of terms) {
            const img = await checkTerm(term);
            if (img) {
                console.log(`  ✅ FOUND: "${term}"`);
                results[tr] = term;
                found = true;
                break;
            } else {
                console.log(`  ❌ Failed: "${term}"`);
            }
        }
        if (!found) {
            console.log(`  ⚠️  NO MATCH FOUND FOR ${tr}`);
            // Fallback to "General" terms if needed in real app
        }
    }

    console.log("\n--- FINAL MAP JSON ---");
    console.log(JSON.stringify(results, null, 2));
}

verify();
