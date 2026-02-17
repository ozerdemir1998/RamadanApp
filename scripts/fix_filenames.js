
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'generated_recipe_images');

const RENAME_MAP = {
    'mıhlama.png': 'mihlama-kuymak.png',
    'cilbir-yemegi.png': 'cilbir.png',
    'menemen.png': 'pratik-menemen.png',
    'tavuk-gogusu.png': 'tavukgogsu.png',
    'karni-yarik.png': 'karniyarik.png',
    'patlcan-salatasi.png': 'patlican-salatasi.png',
    'kabak-cicegi.png': 'kabak-cicegi-dolmasi.png', // Assuming "Kabak Çiçeği Dolması"
    'tavuk-kanat.png': 'tavuk-kanat-izgara.png', // Assuming "Tavuk Kanat Izgara"
    'tavuklu-mantar.png': 'tavuklu-mantar-guvec.png', // Assuming "Tavuklu Mantar Güveç"
    'karnabahar.png': 'karnabahar-graten.png', // Assuming "Karnabahar Graten"
};

console.log('🔧 Fixing filenames...');

for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
    const oldPath = path.join(IMAGE_DIR, oldName);
    const newPath = path.join(IMAGE_DIR, newName);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${oldName} -> ${newName}`);
    } else {
        console.log(`⚠️ Not found: ${oldName} (Maybe already renamed?)`);
    }
}

console.log('✨ Done.');
