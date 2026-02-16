const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------------
// CONFIGURASYON (GITHUB BİLGİLERİNİZİ BURAYA GİRİN)
// ------------------------------------------------------------------
const GITHUB_USERNAME = "ozerdemir1998"; // Github kullanıcı adınız
const GITHUB_REPO = "RamadanApp-Assets"; // Yeni PUBLIC repo adınız
const BRANCH = "main";               // Genellikle main veya master
// ------------------------------------------------------------------

// Service Account
try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (e) {
    console.error("HATA: 'serviceAccountKey.json' bulunamadı veya yüklenemedi:", e.message);
    process.exit(1);
}

const db = admin.firestore();

// assets klasörü kontrolü
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'recipe_images');
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// ----------------------------------------------------
// BING SCRAPER
// ----------------------------------------------------
async function fetchImageFromBing(query) {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + " yemek tarifi")}&first=1&tsc=ImageHoverTitle`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        };
        const response = await axios.get(url, { headers, timeout: 5000 });
        const html = response.data;

        const murlMatch = html.match(/murl&quot;:&quot;(https?:\/\/[^&"]+?\.(jpg|jpeg|png))&quot;/i);
        if (murlMatch && murlMatch[1]) return murlMatch[1];

        const thumbMatch = html.match(/<img[^>]+class=["']mimg["'][^>]+src=["'](https?:\/\/[^"']+)["']/i);
        if (thumbMatch && thumbMatch[1]) return thumbMatch[1];

    } catch (e) { }
    return null;
}

// ----------------------------------------------------
// GOOGLE SCRAPER (Fallback)
// ----------------------------------------------------
async function fetchImageFromGoogle(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query + " yemek")}&tbm=isch&gbv=1`;
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
        const response = await axios.get(url, { headers, timeout: 5000 });
        const html = response.data;
        const matches = html.match(/src="(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"]+)"/);
        if (matches && matches[1]) return matches[1];
    } catch (e) { }
    return null;
}

// ----------------------------------------------------
// SLUGIFY (Dosya isimleri için)
// ----------------------------------------------------
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

async function downloadImageLocally(startUrl, filename) {
    try {
        const response = await axios.get(startUrl, { responseType: 'arraybuffer' });

        // Uzantı belirle
        let ext = 'jpg';
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('png')) ext = 'png';
        if (contentType && contentType.includes('webp')) ext = 'webp';

        const fileNameWithExt = `${filename}.${ext}`;
        const filePath = path.join(ASSETS_DIR, fileNameWithExt);

        fs.writeFileSync(filePath, response.data);
        return fileNameWithExt;
    } catch (e) {
        console.error(`Download Error: ${e.message}`);
        return null;
    }
}

async function updateImages() {
    console.log("----------------------------------------------------------------");
    console.log(`GITHUB USER: ${GITHUB_USERNAME}`);
    console.log(`GITHUB REPO: ${GITHUB_REPO}`);
    console.log("NOT: Script bittikten sonra 'assets/recipe_images' klasörünü commit/push etmelisiniz.");
    console.log("----------------------------------------------------------------");

    // Firestore'dan verileri çek
    const snapshot = await db.collection("recipes").get();
    console.log(`Found ${snapshot.size} recipes. Starting process...`);

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const recipeTitle = data.title;
        const currentImage = data.image;

        // Halihazırda github raw linki varsa atla
        // BUGFIX: Dosyalar silinmiş olabilir, o yüzden tekrar indiriyoruz.
        /*
        if (currentImage && currentImage.includes('raw.githubusercontent.com')) {
             process.stdout.write(`Skipping ${recipeTitle.substring(0, 15)}... (Already GitHub)\n`);
             skippedCount++;
             continue;
        }
        */

        process.stdout.write(`Processing: ${recipeTitle.substring(0, 20).padEnd(20)} | `);

        // 1. Resim URL Bul (Bing -> Google)
        let sourceUrl = await fetchImageFromBing(recipeTitle);
        if (!sourceUrl) sourceUrl = await fetchImageFromGoogle(recipeTitle);

        if (sourceUrl) {
            // 2. İndir (Lokal Klasöre)
            const slug = slugify(recipeTitle);
            const savedFilename = await downloadImageLocally(sourceUrl, slug);

            if (savedFilename) {
                // 3. GitHub Raw Linkini Oluştur ve Kaydet
                // Link formatı: https://raw.githubusercontent.com/[USER]/[REPO]/[BRANCH]/assets/recipe_images/[FILENAME]
                // Kullanıcı ana repodaki 'assets/recipe_images' klasörünü kullanıyor.
                const finalUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/RamadanApp/${BRANCH}/assets/recipe_images/${savedFilename}`;

                await db.collection("recipes").doc(docSnap.id).update({
                    image: finalUrl
                });

                console.log(`✅ SAVED LOCALLY -> DB UPDATED`);
                updatedCount++;
            } else {
                console.log(`❌ DOWNLOAD FAILED`);
                failedCount++;
            }
        } else {
            console.log(`❌ NOT FOUND`);
            failedCount++;
        }

        // Delay
        const delay = Math.floor(Math.random() * 500) + 200;
        await new Promise(r => setTimeout(r, delay));
    }

    console.log("----------------------------------------------------------------");
    console.log(`SUMMARY:`);
    console.log(`Total: ${snapshot.size}`);
    console.log(`Processed: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log("----------------------------------------------------------------");
    console.log("\n⚠️SON ADIM:");
    console.log("Lütfen terminallerde şu komutları çalıştırarak resimleri GitHub'a yükleyin:");
    console.log("1. git add assets/recipe_images");
    console.log("2. git commit -m 'Add recipe images'");
    console.log("3. git push");
}

console.log("Starting GitHub Image Migration...");
updateImages();
