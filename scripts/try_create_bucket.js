const admin = require('firebase-admin');

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

const storage = admin.storage();
const projectId = JSON.parse(require('fs').readFileSync('serviceAccountKey.json')).project_id;
const bucketName = `${projectId}.appspot.com`;

async function createBucket() {
    console.log(`Bucket oluşturulmaya çalışılıyor: ${bucketName}...`);
    try {
        // Location belirtmek bazen "default location missing" sorununu çözer.
        await storage.bucket(bucketName).create({
            location: 'europe-west1', // Avrupa konumu (hızlı erişim için)
        });
        console.log("✅ BAŞARILI: Bucket otomatik oluşturuldu!");
        console.log("Şimdi update_images_from_google.js scriptini çalıştırabilirsiniz.");
    } catch (e) {
        console.error("❌ HATA: Bucket oluşturulamadı.");
        console.error("Detay:", e.message);

        if (e.message.includes("already owner") || e.message.includes("409")) {
            console.log("\n⚠️ BUCKET ZATEN VAR!");
            console.log("Demek ki bucket zaten oluşturulmuş ama scriptte yanlış isim kullanılıyor olabilir.");
            console.log("Lütfen update_images_from_google.js dosyasındaki 'storageBucket' kısmını kontrol edin:");
            console.log(`storageBucket: "${bucketName}"`);
        } else if (e.message.includes("billing")) {
            console.log("\n⚠️ FATURALANDIRMA ZORUNLULUĞU:");
            console.log("Google Cloud Storage, otomatik bucket oluşturmak için Blaze (ücretli) planı istiyor olabilir.");
            console.log("Tek çözüm: Firebase Console'dan 'Blaze' planına geçmek veya manuel oluşturmayı denemek.");
        }
    }
}

createBucket();
