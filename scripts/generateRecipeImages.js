/**
 * Yemek Görseli Oluşturucu (Recipe Image Generator)
 * 
 * Gemini 2.0 Flash Image Generation modeli kullanır.
 * Ücretsiz kota sınırlı olduğundan, script kaldığı yerden devam eder.
 * Kota dolduğunda scripti durdurup birkaç dakika sonra tekrar çalıştırın.
 * 
 * Kullanım: node scripts/generateRecipeImages.js
 */

const fs = require('fs');
const path = require('path');

// --- YAPILANDIRMA ---
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyBfQGSEVb102lAIvAVUerHJkI1QI1SwWOM',
    FIREBASE_PROJECT_ID: 'ramadanapp-b9046',
    GITHUB_RAW_BASE: 'https://raw.githubusercontent.com/ozerdemir1998/RamadanApp/main/assets/recipe_images',
    OUTPUT_DIR: path.resolve(__dirname, '..', 'assets', 'generated_recipe_images'),

    // Çalışan model
    GEMINI_MODEL: 'gemini-2.0-flash-exp-image-generation',

    // İstekler arası bekleme (kota aşmamak için)
    DELAY_BETWEEN_REQUESTS_MS: 30000, // 30 saniye

    // Retry ayarları
    MAX_RETRIES: 10,
    RETRY_DELAY_MS: 30000, // 30 saniye

    // Prompt şablonu
    PROMPT_TEMPLATE: (foodName) =>
        `Professional food photography of "${foodName}", a traditional Turkish dish. ` +
        `The food is beautifully presented on a blue ceramic plate or bowl, placed on a clean white marble table. ` +
        `Soft warm lighting from the upper left, 45-degree top-down angle, shallow depth of field. ` +
        `Photorealistic, appetizing, restaurant quality. No text, no watermarks, no people, no utensils.`
};

// --- YARDIMCI FONKSİYONLAR ---

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Firebase Firestore REST API'den tüm tarifleri çek
 */
async function fetchRecipesFromFirebase() {
    console.log('🔥 Firebase\'den tarifler çekiliyor...');

    const url = `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE_PROJECT_ID}/databases/(default)/documents/recipes?pageSize=500`;

    let allRecipes = [];
    let nextPageToken = null;

    do {
        const fetchUrl = nextPageToken ? `${url}&pageToken=${nextPageToken}` : url;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            throw new Error(`Firebase API hatası: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.documents) {
            const recipes = data.documents.map(doc => {
                const fields = doc.fields;
                const docId = doc.name.split('/').pop();
                return {
                    id: docId,
                    title: fields.title?.stringValue || '',
                    image: fields.image?.stringValue || '',
                    category: fields.category?.stringValue || ''
                };
            });
            allRecipes = allRecipes.concat(recipes);
        }

        nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    console.log(`✅ ${allRecipes.length} tarif bulundu.`);
    return allRecipes;
}

/**
 * GitHub'dan referans görselini indir ve base64 olarak döndür
 */
async function downloadImageAsBase64(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Görsel indirilemedi: ${response.status} - ${imageUrl}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const ext = imageUrl.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return { base64, mimeType };
}

/**
 * Yemek adından dosya adı türet
 */
function titleToFilename(title) {
    return title
        .toLowerCase()
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * GitHub'daki mevcut dosya listesini al
 */
async function getGitHubFileList() {
    console.log('📂 GitHub\'dan dosya listesi çekiliyor...');
    const url = 'https://api.github.com/repos/ozerdemir1998/RamadanApp/contents/assets/recipe_images';
    const response = await fetch(url, {
        headers: { 'User-Agent': 'RamadanApp-ImageGenerator' }
    });
    if (!response.ok) throw new Error(`GitHub API hatası: ${response.status}`);
    const files = await response.json();
    const fileMap = {};
    files.forEach(file => {
        const nameWithoutExt = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        fileMap[nameWithoutExt] = file.name;
    });
    console.log(`✅ GitHub'da ${Object.keys(fileMap).length} görsel bulundu.`);
    return fileMap;
}

/**
 * Gemini API ile görsel oluştur (referans görsel + prompt)
 */
async function generateImage(foodName, refBase64, refMimeType) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    const parts = [{ text: CONFIG.PROMPT_TEMPLATE(foodName) }];

    // Referans görsel varsa ekle
    if (refBase64) {
        parts.push({
            inline_data: { mime_type: refMimeType, data: refBase64 }
        });
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 1.0
        }
    };

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 429) {
            if (attempt === CONFIG.MAX_RETRIES) {
                // Son deneme - dur ve kullanıcıya bildir
                console.log(`\n   🛑 Kota doldu! Script tekrar çalıştırıldığında kaldığı yerden devam edecek.`);
                console.log(`      Birkaç dakika bekleyip tekrar çalıştırın: node scripts/generateRecipeImages.js`);
                process.exit(0);
            }
            // Exponential backoff: Base * 2^(attempt-1)
            const waitTime = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(`   ⏳ Rate limit! ${waitTime / 1000}s bekleniyor... (Deneme ${attempt}/${CONFIG.MAX_RETRIES})`);
            await sleep(waitTime);
            continue;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API hatası: ${response.status} - ${errorText.substring(0, 300)}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData) {
                    return {
                        base64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png'
                    };
                }
            }
        }

        throw new Error('API yanıtında görsel bulunamadı.');
    }
}

/**
 * Base64 veriyi dosyaya kaydet
 */
function saveImage(base64Data, outputPath) {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, buffer);
}

// --- ANA FONKSİYON ---

async function main() {
    console.log('🍽️  Yemek Görseli Oluşturucu');
    console.log(`📌 Model: ${CONFIG.GEMINI_MODEL}`);
    console.log(`⏱️  İstekler arası: ${CONFIG.DELAY_BETWEEN_REQUESTS_MS / 1000}s\n`);

    // Çıktı klasörünü oluştur
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }

    // Firebase'den tarifleri çek
    const recipes = await fetchRecipesFromFirebase();
    if (recipes.length === 0) { console.log('❌ Hiç tarif bulunamadı!'); return; }

    // GitHub dosya listesini al
    const githubFiles = await getGitHubFileList();

    // Durumu say
    let successCount = 0, skipCount = 0, errorCount = 0;

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const progress = `[${i + 1}/${recipes.length}]`;
        const outputFilename = titleToFilename(recipe.title) + '.png';
        const outputPath = path.join(CONFIG.OUTPUT_DIR, outputFilename);

        // Zaten varsa atla
        if (fs.existsSync(outputPath)) {
            console.log(`⏭️  ${progress} "${recipe.title}" - Mevcut, atlanıyor.`);
            skipCount++;
            continue;
        }

        console.log(`\n🎨 ${progress} "${recipe.title}" işleniyor...`);

        try {
            // Referans görseli bul ve indir
            let refBase64 = null, refMimeType = null;
            const sluggedName = titleToFilename(recipe.title);
            const githubFilename = githubFiles[sluggedName];

            if (githubFilename) {
                const githubUrl = `${CONFIG.GITHUB_RAW_BASE}/${githubFilename}`;
                console.log(`   📥 Referans: ${githubFilename}`);
                const ref = await downloadImageAsBase64(githubUrl);
                refBase64 = ref.base64;
                refMimeType = ref.mimeType;
            } else if (recipe.image && recipe.image.startsWith('http')) {
                console.log(`   📥 Referans: URL'den indiriliyor...`);
                const ref = await downloadImageAsBase64(recipe.image);
                refBase64 = ref.base64;
                refMimeType = ref.mimeType;
            } else {
                console.log(`   ⚠️  Referans görsel yok, sadece prompt ile oluşturuluyor.`);
            }

            // Görsel oluştur
            console.log(`   🤖 Görsel oluşturuluyor...`);
            const generated = await generateImage(recipe.title, refBase64, refMimeType);

            // Kaydet
            saveImage(generated.base64, outputPath);
            console.log(`   ✅ Kaydedildi: ${outputFilename}`);
            successCount++;

        } catch (error) {
            console.error(`   ❌ Hata: ${error.message}`);
            errorCount++;
        }

        // Bekle
        if (i < recipes.length - 1) {
            console.log(`   ⏳ ${CONFIG.DELAY_BETWEEN_REQUESTS_MS / 1000}s bekleniyor...`);
            await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
        }
    }

    // Özet
    console.log('\n' + '='.repeat(50));
    console.log('📊 SONUÇ ÖZETİ');
    console.log('='.repeat(50));
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`⏭️  Atlanan: ${skipCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`📁 Çıktı: ${CONFIG.OUTPUT_DIR}`);
    console.log('='.repeat(50));
}

main().catch(error => {
    console.error('\n💥 Kritik Hata:', error.message);
    process.exit(1);
});
