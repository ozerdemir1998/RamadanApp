const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const carbRecipes = [
    // --- MAKARNA ---
    { "category": "Makarna", "title": "Spagetti Bolonez", "image": "", "ingredients": ["Spagetti", "Kıyma", "Domates sosu"], "instructions": "Makarnayı haşlayıp kıymalı sosla harmanlayın." },
    { "category": "Makarna", "title": "Fırın Makarna", "image": "", "ingredients": ["Kalın çubuk makarna", "Beşamel sos", "Kaşar"], "instructions": "Haşlanmış makarnayı sosla karıştırıp fırınlayın." },
    { "category": "Makarna", "title": "Mantı", "image": "", "ingredients": ["Un", "Kıyma", "Yoğurt", "Sarımsak"], "instructions": "Hamuru açıp kıymalı harçla kapatın, haşlayıp yoğurtla servis edin." },
    { "category": "Makarna", "title": "Erişte", "image": "", "ingredients": ["Erişte", "Tereyağı", "Ceviz"], "instructions": "Erişteleri haşlayıp tereyağlı cevizle karıştırın." },
    { "category": "Makarna", "title": "Domatesli Makarna", "image": "", "ingredients": ["Kalem makarna", "Domates", "Fesleğen"], "instructions": "Domatesleri soteleyip makarna ile birleştirin." },

    // --- PİLAV ---
    { "category": "Pilav", "title": "Pirinç Pilavı", "image": "", "ingredients": ["Pirinç", "Tereyağı", "Şehriye"], "instructions": "Pirinci kavurup sıcak su ile demleyin." },
    { "category": "Pilav", "title": "Bulgur Pilavı", "image": "", "ingredients": ["Bulgur", "Salça", "Soğan"], "instructions": "Soğan ve salçayı kavurup bulguru ekleyin." },
    { "category": "Pilav", "title": "İç Pilav", "image": "", "ingredients": ["Pirinç", "Ciğer", "Kuş üzümü", "Fıstık"], "instructions": "Baharatlı ve ciğerli pilavı hazırlayıp demleyin." },
    { "category": "Pilav", "title": "Meyhane Pilavı", "image": "", "ingredients": ["Bulgur", "Domates", "Biber", "Et suyu"], "instructions": "Sebzeli bulgur pilavını et suyu ile pişirin." },
    { "category": "Pilav", "title": "Perde Pilavı", "image": "", "ingredients": ["Hamur", "Pirinç", "Tavuk", "Badem"], "instructions": "Pilavı hamurla kaplayıp fırında pişirin." },

    // --- BÖREK / HAMUR İŞİ ---
    { "category": "Börek", "title": "Su Böreği", "image": "", "ingredients": ["Yufka", "Peynir", "Tereyağı"], "instructions": "Haşlanmış yufkaları peynirle döşeyip fırınlayın." },
    { "category": "Börek", "title": "Sigara Böreği", "image": "", "ingredients": ["Yufka", "Lor peyniri", "Maydanoz"], "instructions": "İnce rulo sarıp kızartın." },
    { "category": "Börek", "title": "Gül Böreği", "image": "", "ingredients": ["Yufka", "Ispanak", "Peynir"], "instructions": "Yufkaları gül şeklinde sarıp fırınlayın." },
    { "category": "Börek", "title": "Kol Böreği", "image": "", "ingredients": ["El açması yufka", "Kıyma", "Soğan"], "instructions": "Uzun ruloları tepsiye dizip pişirin." },
    { "category": "Börek", "title": "Peynirli Pide", "image": "", "ingredients": ["Hamur", "Kaşar peyniri", "Tereyağı"], "instructions": "Hamuru açıp peynirle doldurun ve taş fırında pişirin." }
];

async function upload() {
    console.log("Adding Carbohydrate recipes with Admin SDK...");
    const colRef = db.collection("recipes");

    for (const recipe of carbRecipes) {
        try {
            await colRef.add({
                ...recipe,
                createdAt: new Date().toISOString()
            });
            console.log(`Uploaded: ${recipe.title}`);
            await new Promise(r => setTimeout(r, 100)); // Rate limiting
        } catch (e) {
            console.error(`Error ${recipe.title}:`, e);
        }
    }
    console.log("Done!");
}

upload();
