
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    FIREBASE_PROJECT_ID: 'ramadanapp-b9046',
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

async function checkUnmapped() {
    console.log("🔥 Checking for unmapped images...");

    // 1. Get all recipes
    const snapshot = await db.collection('recipes').get();
    const recipeSlugs = new Set();

    snapshot.forEach(doc => {
        recipeSlugs.add(slugify(doc.data().title));
    });

    // 2. Scan directory
    const files = fs.readdirSync(CONFIG.IMAGE_DIR).filter(f => f.endsWith('.png'));

    console.log(`📂 Scanning ${files.length} images...`);

    let unmappedCount = 0;

    for (const file of files) {
        const slug = file.replace('.png', '').replace(/-\d+$/, '');

        if (!recipeSlugs.has(slug)) {
            console.log(`❓ Unmapped File: ${file} (Slug: ${slug})`);
            unmappedCount++;
        }
    }

    if (unmappedCount === 0) {
        console.log("✅ All files map to a recipe!");
    } else {
        console.log(`⚠️ ${unmappedCount} files do not map to any recipe.`);
    }

    // Check what is MISSING
    console.log("\n🔍 Checking for MISSING images:");
    const fileSlugs = new Set(files.map(f => f.replace('.png', '').replace(/-\d+$/, '')));
    let missingCount = 0;

    recipeSlugs.forEach(slug => {
        if (!fileSlugs.has(slug)) {
            console.log(`❌ Missing Image for: ${slug}`);
            missingCount++;
        }
    });
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

checkUnmapped();
