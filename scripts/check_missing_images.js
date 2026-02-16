const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// GitHub file list (hardcoded from previous step output for speed)
const GITHUB_FILES = [
    'akdeniz-salatasi.jpg', 'akitma.jpg', 'ali-nazik.jpg', 'anali-kizli-corbasi.jpg', 'ankara-tava.jpg',
    'arnavut-cigeri.jpg', 'avci-boregi.jpg', 'baklava.png', 'bamya.jpg', 'beyran.jpg', 'beyti-kebap.jpg',
    'biber-dolmasi.jpg', 'borulce-salatasi.jpg', 'brokoli-corbasi.jpg', 'bugday-salatasi.jpg', 'cilbir.jpg',
    'coban-kavurma.jpg', 'coban-salatasi.jpg', 'domates-corbasi.jpg', 'domatesli-ekmek.jpg', 'domatesli-makarna.jpg',
    'dugun-corbasi.jpg', 'ebegumeci-kavurmasi.jpg', 'eriste.jpg', 'etli-ekmek.jpg', 'ezogelin-corbasi.jpg',
    'findik-lahmacun.jpg', 'firin-makarna.png', 'firin-mantar.jpg', 'firin-sutlac.jpg', 'gavurdagi-salatasi.jpg',
    'gullac.jpg', 'hellim-izgara.jpg', 'hunkar-begendi.jpg', 'ic-pilav.jpg', 'icli-kofte-haslama.jpg',
    'icli-kofte.jpg', 'imambayildi.jpg', 'irmik-helvasi.jpg', 'iskembe-corbasi.jpg', 'iskender-kebap.jpg',
    'ispanak-kavurma.jpg', 'izmir-kofte.jpg', 'kabak-cicegi-dolmasi.jpg', 'kabak-kalye.jpg', 'kabak-tatlisi.jpg',
    'kadinbudu-kofte.jpg', 'kagit-kebabi.jpg', 'karides-guvec.jpg', 'karnabahar-graten.jpg', 'karniyarik.jpg',
    'kayseri-mantisi.jpg', 'kayseri-yaglamasi.jpg', 'kazandibi.jpg', 'kelle-paca-corbasi.jpg', 'kemalpasa.jpg',
    'keskul.jpg', 'kisir.jpg', 'kiymali-yumurta.jpg', 'kremali-tavuklu-makarna.jpg', 'kunefe.jpg',
    'kuskus-pilavi.jpg', 'lebeniye-corbasi.jpg', 'lokma.jpg', 'mantar-corbasi.jpg', 'mantarli-ispanak.jpg',
    'mantarli-yumurta.jpg', 'mercimekli-bulgur-pilavi.jpg', 'mevsim-salatasi.jpg', 'meyhane-pilavi.jpg',
    'mihlama-kuymak.jpg', 'mucver.jpg', 'nohutlu-pilav.jpg', 'pacanga-boregi.jpg', 'pancar-salatasi.jpg',
    'pastirmali-humus.jpg', 'patates-salatasi.jpg', 'patatesli-omlet.jpg', 'patlican-salatasi.jpg',
    'perde-pilavi.jpg', 'peynir-ezmesi.jpg', 'peynirli-kroket.jpg', 'piyaz.jpg', 'pratik-menemen.jpg',
    'profiterol.jpg', 'revani.jpg', 'roka-salatasi.jpg', 'sac-kavurma.jpg', 'sahur-boregi.jpg',
    'sebzeli-bulgur-pilavi.jpg', 'sehriye-corbasi.jpg', 'sehriyeli-pirinc-pilavi.jpg', 'sekerpare.jpg',
    'semizotu-salatasi.jpg', 'sezar-salata.jpg', 'sigara-boregi.jpg', 'sucuklu-yumurta.jpg',
    'suzme-mercimek-corbasi.jpg', 'tarhana-corbasi.jpg', 'tas-kebabi.jpg', 'tavuk-haslama.jpg',
    'tavuk-kanat-izgara.jpg', 'tavuk-kapama.jpg', 'tavuk-sinitzel.jpg', 'tavuk-sis.jpg', 'tavuk-sote.jpg',
    'tavuk-suyu-corbasi.jpg', 'tavukgogsu.png', 'tavuklu-cokertme.jpg', 'tavuklu-mantar-guvec.jpg',
    'tavuklu-pilav.jpg', 'tavuklu-saray-sarmasi.jpg', 'ton-balikli-salata.jpg', 'trilece.png', 'turlu.jpg',
    'yaprak-sarma.jpg', 'yayla-corbasi.jpg', 'yumurtali-ekmek.jpg', 'zeytinyagli-bakla.jpg',
    'zeytinyagli-enginar.jpg', 'zeytinyagli-pirasa.jpg', 'zeytinyagli-taze-fasulye.jpg'
];

async function compare() {
    console.log("Fetching recipes from DB...");
    const snapshot = await db.collection("recipes").get();

    console.log(`Checking ${snapshot.size} recipes against ${GITHUB_FILES.length} repo files...\n`);

    let missingCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const imageUrl = data.image;
        if (!imageUrl) continue;

        // Extract filename from URL
        // https://raw.githubusercontent.com/.../assets/recipe_images/kabak-tatlisi.jpg
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];

        if (!GITHUB_FILES.includes(filename)) {
            console.log(`❌ MISSING IN REPO: ${data.title}`);
            console.log(`   - Defined URL: ${imageUrl}`);
            console.log(`   - Expected File: ${filename}`);
            missingCount++;
        }
    }

    if (missingCount === 0) {
        console.log("\n✅ ALL DB IMAGES EXIST IN REPO!");
    } else {
        console.log(`\n⚠️ FOUND ${missingCount} RECIPES WITH MISSING IMAGES.`);
    }
}

compare();
