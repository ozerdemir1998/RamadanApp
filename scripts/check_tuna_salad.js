const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function checkRecipe() {
    console.log("Searching for 'Ton Balıklı Salata'...");
    const snapshot = await db.collection("recipes").where('title', '==', 'Ton Balıklı Salata').get();

    if (snapshot.empty) {
        console.log("❌ Recipe NOT found in DB!");
        return;
    }

    snapshot.forEach(doc => {
        console.log("✅ Recipe Found:");
        console.log(doc.data());
    });
}

checkRecipe();
