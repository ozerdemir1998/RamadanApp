
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// --- CONFIG ---
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyBfQGSEVb102lAIvAVUerHJkI1QI1SwWOM',
    FIREBASE_PROJECT_ID: 'ramadanapp-b9046',
    IMAGE_DIR: path.join(__dirname, '..', 'assets', 'generated_recipe_images'),
    // Using 2.0-flash as confirmed in list
    MODEL_NAME: 'gemini-2.0-flash',
    MAX_RETRIES: 5,
    RETRY_DELAY_MS: 5000
};

// --- SETUP FIREBASE ---
try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (e) {
    console.error("❌ Service Account Key load failed:", e.message);
    process.exit(1);
}
const db = admin.firestore();

// --- HELPERS ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text) {
    const trMap = {
        'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
        'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
        'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O'
    };
    return text
        .split('').map(char => trMap[char] || char).join('')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// --- CORE ---

async function fetchRecipeNames() {
    console.log('🔥 Fetching recipes from Firestore...');
    const snapshot = await db.collection('recipes').get();
    const recipes = snapshot.docs.map(doc => doc.data().title).filter(Boolean);
    console.log(`✅ Loaded ${recipes.length} recipes.`);
    return recipes;
}

// Convert image to Base64 for Gemini API
function getImageBase64(filePath) {
    return fs.readFileSync(filePath, { encoding: 'base64' });
}

// Identify image using Gemini
async function identifyDish(base64Image, recipeList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    // Construct prompt
    const prompt = `I have a set of Turkish food images and I need to match them to their names.
    
Here is the list of possible dishes:
${JSON.stringify(recipeList)}

Look at the image provided. Return ONLY the exact name of the dish from the list above that best matches this image.
Do not explain, do not add punctuation, just return the exact string from the list.
If you are unsure, pick the closest visual match from the list.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/png', data: base64Image } }
            ]
        }],
        generationConfig: {
            temperature: 0.1, // Low temperature for consistent, exact matches
            maxOutputTokens: 50
        }
    };

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) {
                const waitTime = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(`   ⏳ Rate limit (429). Waiting ${waitTime / 1000}s...`);
                await sleep(waitTime);
                continue;
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!text) throw new Error('No text returned from Gemini');

            // Clean up response just in case (remove markdown, quotes)
            const cleanText = text.replace(/```/g, '').replace(/\n/g, '').trim();

            // Validation: Is it in the list?
            if (recipeList.includes(cleanText)) {
                return cleanText;
            } else {
                // Fuzzy match or assume it's valid if close enough? 
                // Let's try to find exact match insensitive
                const exactMatch = recipeList.find(r => r.toLowerCase() === cleanText.toLowerCase());
                if (exactMatch) return exactMatch;

                console.warn(`   ⚠️ Model returned "${cleanText}" which is not in the list exactly.`);
                return cleanText; // Return anyway, user can verify
            }

        } catch (error) {
            console.error(`   ❌ Attempt ${attempt} failed: ${error.message}`);
            if (attempt === CONFIG.MAX_RETRIES) throw error;
            await sleep(2000);
        }
    }
}

async function main() {
    const recipes = await fetchRecipeNames();

    // Get all 'Gemini_...' files
    const allFiles = fs.readdirSync(CONFIG.IMAGE_DIR);
    const targetFiles = allFiles.filter(f => f.startsWith('Gemini_') && f.endsWith('.png'));

    console.log(`📂 Found ${targetFiles.length} images to rename in ${CONFIG.IMAGE_DIR}\n`);

    if (targetFiles.length === 0) {
        console.log("Nothing to do.");
        return;
    }

    let successCount = 0;
    let failCount = 0;

    // Track assigned recipes to avoid duplicates (optional, but good for reporting)
    const assignedRecipes = new Set();

    for (let i = 0; i < targetFiles.length; i++) {
        const file = targetFiles[i];
        const oldPath = path.join(CONFIG.IMAGE_DIR, file);

        console.log(`[${i + 1}/${targetFiles.length}] Processing: ${file}`);

        try {
            const base64 = getImageBase64(oldPath);
            const dishName = await identifyDish(base64, recipes);

            console.log(`   💡 Identified as: "${dishName}"`);

            const slug = slugify(dishName);
            let newFilename = `${slug}.png`;
            let newPath = path.join(CONFIG.IMAGE_DIR, newFilename);

            // Handle duplicates: if karniyarik.png exists, try karniyarik-2.png
            let counter = 2;
            while (fs.existsSync(newPath)) {
                console.log(`   ⚠️ ${newFilename} exists, trying suffix...`);
                newFilename = `${slug}-${counter}.png`;
                newPath = path.join(CONFIG.IMAGE_DIR, newFilename);
                counter++;
            }

            fs.renameSync(oldPath, newPath);
            console.log(`   ✅ Renamed to: ${newFilename}`);
            assignedRecipes.add(dishName);
            successCount++;

        } catch (err) {
            console.error(`   ❌ Failed to process ${file}:`, err.message);
            failCount++;
        }

        // Rate limiting spacing
        await sleep(2000);
    }

    console.log('\n' + '='.repeat(40));
    console.log(`🎉 Done! Success: ${successCount}, Failed: ${failCount}`);
}

main();
