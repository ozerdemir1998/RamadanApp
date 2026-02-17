
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const CONFIG = {
    FIREBASE_PROJECT_ID: 'ramadanapp-b9046',
    // GitHub Raw URL Base
    GITHUB_RAW_BASE: 'https://raw.githubusercontent.com/ozerdemir1998/RamadanApp/main/assets/generated_recipe_images',
    IMAGE_DIR: path.join(__dirname, '..', 'assets', 'generated_recipe_images')
};

// --- SETUP ---
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

// --- CORE ---
async function updateLinks() {
    console.log("🔥 Updating Firestore with new image links...");

    // 1. Get all recipes to create a lookup map
    const snapshot = await db.collection('recipes').get();
    const recipeMap = {}; // slug -> docId

    snapshot.forEach(doc => {
        const data = doc.data();
        const slug = slugify(data.title);
        recipeMap[slug] = doc.id;
    });

    // 2. Scan directory
    const files = fs.readdirSync(CONFIG.IMAGE_DIR).filter(f => f.endsWith('.png') && !f.startsWith('Gemini_'));

    console.log(`📂 Found ${files.length} successfully renamed images.`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const file of files) {
        const slug = file.replace('.png', '').replace(/-\d+$/, ''); // remove extension and any suffix like -2

        // Find matching recipe
        const docId = recipeMap[slug];

        if (docId) {
            const newUrl = `${CONFIG.GITHUB_RAW_BASE}/${file}`;

            await db.collection('recipes').doc(docId).update({
                image: newUrl
            });

            process.stdout.write(`✅ Updated: ${slug} -> ${newUrl}\n`);
            updatedCount++;
        } else {
            console.log(`❌ No recipe found for slug: ${slug} (File: ${file})`);
            notFoundCount++;
        }
    }

    console.log('\n' + '='.repeat(40));
    console.log(`🎉 Summary:`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not Found/Skipped: ${notFoundCount}`);
    console.log('='.repeat(40));
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

updateLinks();
