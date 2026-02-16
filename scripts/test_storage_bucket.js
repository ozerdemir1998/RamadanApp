const admin = require('firebase-admin');

// 1. Service Account Yükle
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

// 2. Storage Client'a Eriş
// Not: admin.storage() servisini değil, Google Cloud Storage istemcisini alıyoruz
const storage = admin.storage();

async function listBuckets() {
    try {
        console.log("Bucket'lar sorgulanıyor...");

        // GCS Client'ına erişmek için trick: herhangi bir bucket üzerinden .storage'a ulaşıyoruz
        const gcs = storage.bucket('dummy-bucket').storage;

        const [buckets] = await gcs.getBuckets();

        if (!buckets || buckets.length === 0) {
            console.log("---------------------------------------------------");
            console.log("❌ HİÇ BUCKET BULUNAMADI!");
            console.log("---------------------------------------------------");
            console.log("Bunun sebebi şunlar olabilir:");
            console.log("1. Firebase Storage HİÇ AÇILMAMIŞ. Lütfen Console'dan 'Get Started' yapın.");
            console.log("2. Google Cloud Platform'da proje storage API'si kapalı.");
            console.log("Link: https://console.firebase.google.com/u/0/project/ramadanapp-b9046/storage");
        } else {
            console.log("---------------------------------------------------");
            console.log("✅ BULUNAN BUCKET'LAR:");
            console.log("---------------------------------------------------");
            buckets.forEach(bucket => {
                console.log(`👉 ${bucket.name}`);
            });
            console.log("\nLütfen yukarıdaki ismi kopyalayıp script dosyasındaki 'storageBucket' alanına yapıştırın.");
        }

    } catch (e) {
        console.error("HATA:", e.message);
        if (e.message.includes("API has not been used") || e.message.includes("disabled")) {
            console.log("\n⚠️ İPUCU: Google Cloud Storage API henüz etkinleştirilmemiş olabilir.");
            console.log("Lütfen Firebase Console -> Storage sayfasına gidip kurulumu tamamlayın.");
        }
    }
}

listBuckets();
