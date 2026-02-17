
const fs = require('fs');
const path = require('path');

// --- PREDETERMINED MISSING RECIPES ---
const MISSING_RECIPES = [
    { title: 'Sahur Böreği', slug: 'sahur-boregi' },
    { title: 'Baklava', slug: 'baklava' },
    { title: 'Profiterol', slug: 'profiterol' },
    { title: 'İçli Köfte (Haşlama)', slug: 'icli-kofte-haslama' }
];

const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyBfQGSEVb102lAIvAVUerHJkI1QI1SwWOM',
    MODEL_NAME: 'gemini-2.0-flash-exp-image-generation',
    OUTPUT_DIR: path.join(__dirname, '..', 'assets', 'generated_recipe_images'),
    PROMPT_TEMPLATE: (foodName) =>
        `Professional food photography of "${foodName}", a traditional Turkish dish. ` +
        `The food is beautifully presented on a blue ceramic plate or bowl, placed on a clean white marble table. ` +
        `Soft warm lighting from the upper left, 45-degree top-down angle, shallow depth of field. ` +
        `Photorealistic, appetizing, restaurant quality. No text, no watermarks, no people, no utensils.`
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateImage(title) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: CONFIG.PROMPT_TEMPLATE(title) }] }],
        generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 1.0
        }
    };

    console.log(`   🎨 Generating: "${title}"...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 429) {
            console.log("   ⏳ Rate limit (429)! Waiting 30s...");
            await sleep(30000);
            return generateImage(title); // Retry
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data; // Base64
                }
            }
        }
        throw new Error("No image data returned.");

    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
        return null;
    }
}

async function main() {
    // 1. Rename mücver.png if exists
    const oldMucver = path.join(CONFIG.OUTPUT_DIR, 'mücver.png');
    const newMucver = path.join(CONFIG.OUTPUT_DIR, 'mucver.png');
    if (fs.existsSync(oldMucver)) {
        fs.renameSync(oldMucver, newMucver);
        console.log("✅ Renamed: mücver.png -> mucver.png");
    }

    // 2. Generate Missing
    for (const item of MISSING_RECIPES) {
        const outputPath = path.join(CONFIG.OUTPUT_DIR, `${item.slug}.png`);

        if (fs.existsSync(outputPath)) {
            console.log(`⏩ Exists: ${item.slug}.png`);
            continue;
        }

        console.log(`\nProcessing: ${item.title}`);
        const base64 = await generateImage(item.title);

        if (base64) {
            fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
            console.log(`   ✅ Saved: ${item.slug}.png`);
        }

        await sleep(5000); // Wait between requests
    }
}

main();
