
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets', 'generated_recipe_images');
const QUALITY = 80;
const MAX_WIDTH = 800;

async function optimizeImages() {
    console.log(`🚀 Starting Image Optimization in: ${INPUT_DIR}`);

    if (!fs.existsSync(INPUT_DIR)) {
        console.error("❌ Directory not found!");
        return;
    }

    const files = fs.readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));

    console.log(`📂 Found ${files.length} images.`);

    let processed = 0;
    let savedSpace = 0;

    for (const file of files) {
        const filePath = path.join(INPUT_DIR, file);
        const originalStats = fs.statSync(filePath);

        // Skip if already small (e.g. < 300KB)
        if (originalStats.size < 300 * 1024) {
            console.log(`⏭️ Skipped (already optimized): ${file}`);
            continue;
        }

        const tempPath = path.join(INPUT_DIR, `temp_${file}`);

        try {
            await sharp(filePath)
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .jpeg({ quality: QUALITY, mozjpeg: true }) // Convert to JPEG for better compression
                .toFile(tempPath);

            const newStats = fs.statSync(tempPath);

            // Replace original (change extension to .jpg if it was png, but for simplicity let's keep name if possible or just use jpg)
            // actually, consistent extension is better. Let's make everything .jpg for web optimization if we can update DB. 
            // BUT, user asked to optimize. Changing extension breaks DB links unless I update DB.
            // Let's stick to PNG output but compressed? No, PNG compression is bad for photos.
            // I WILL CONVERT TO JPEG. And I will need to update DB links? 
            // Wait, the user has existing links ending in .png.
            // If I change to .jpg, I must update DB. 
            // Recommendation: Convert to .jpg, then run update_db_links.js (I need to modify it to verify .jpg too).

            // Actually, `sharp` can compress PNGs too (palette, compression level).
            // Let's try balanced approach: Resize + PNG compression first to avoid breaking links.
            // If still too big, we switch to JPG.

            // Re-reading logic: The goal is "Speed". JPEG is much faster/smaller for photos.
            // I will convert to .jpg and RE-RUN update_db_links.js which scans the directory.
            // update_db_links.js currently filters for .png. I should update it to support .jpg.

            // Let's overwrite as .jpg and remove .png
            const newFilename = file.replace(/\.png$/i, '.jpg');
            const finalPath = path.join(INPUT_DIR, newFilename);

            fs.renameSync(tempPath, finalPath);
            if (newFilename !== file) {
                fs.unlinkSync(filePath); // Delete old .png
            }

            const saved = originalStats.size - newStats.size;
            savedSpace += saved;
            processed++;

            console.log(`✅ Optimized: ${file} -> ${newFilename} (${(originalStats.size / 1024).toFixed(0)}KB -> ${(newStats.size / 1024).toFixed(0)}KB)`);

        } catch (err) {
            console.error(`❌ Failed: ${file}`, err.message);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }

    console.log(`\n🎉 Done! Processed: ${processed} images.`);
    console.log(`💾 Total Space Saved: ${(savedSpace / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
