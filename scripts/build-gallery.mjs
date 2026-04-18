/**
 * Gallery Build Script
 * 
 * 1. Scans images/photography/ for all image files
 * 2. Generates small thumbnails (400px wide) in images/photography/thumbs/
 * 3. Writes a gallery.json manifest that the frontend reads
 *
 * Usage: node scripts/build-gallery.mjs
 * Run this after adding new photos to images/photography/
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'fs/promises';
import path from 'path';

const SRC_DIR = './images/photography';
const THUMB_DIR = './images/photography/thumbs';
const MANIFEST = './gallery.json';
const THUMB_WIDTH = 400;
const VALID_EXTS = ['.webp', '.jpg', '.jpeg', '.png'];

async function buildGallery() {
    // Ensure thumbs directory exists
    await mkdir(THUMB_DIR, { recursive: true });

    const files = await readdir(SRC_DIR);
    const images = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return VALID_EXTS.includes(ext) && !f.startsWith('.');
    });

    console.log(`Found ${images.length} images in ${SRC_DIR}\n`);

    const manifest = [];

    for (const file of images) {
        const srcPath = path.join(SRC_DIR, file);
        const thumbName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const thumbPath = path.join(THUMB_DIR, thumbName);

        try {
            const metadata = await sharp(srcPath).metadata();
            const srcStats = await stat(srcPath);
            
            // EXIF Orientation 5-8 means dimensions are flipped (portrait/landscape swap)
            const isFlipped = metadata.orientation && metadata.orientation >= 5;
            const actualWidth = isFlipped ? metadata.height : metadata.width;
            const actualHeight = isFlipped ? metadata.width : metadata.height;

            // Generate thumbnail (always WebP, 400px wide)
            await sharp(srcPath)
                .rotate() // Auto-orient based on EXIF
                .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
                .webp({ quality: 75 })
                .toFile(thumbPath);

            const thumbStats = await stat(thumbPath);

            manifest.push({
                file: file,
                thumb: `thumbs/${thumbName}`,
                width: actualWidth,
                height: actualHeight,
                // Aspect ratio helps the browser reserve space before load
                aspect: +(actualWidth / actualHeight).toFixed(3)
            });

            const srcKB = Math.round(srcStats.size / 1024);
            const thumbKB = Math.round(thumbStats.size / 1024);
            console.log(`  ✓ ${file} (${srcKB}KB) → thumb (${thumbKB}KB)`);
        } catch (err) {
            console.log(`  ✗ ${file} — ${err.message}`);
        }
    }

    // Sort by aspect ratio for better masonry packing
    manifest.sort((a, b) => b.aspect - a.aspect);

    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
    console.log(`\n✓ Wrote ${MANIFEST} with ${manifest.length} entries`);
    console.log(`✓ Thumbnails saved to ${THUMB_DIR}`);
    console.log(`\nTotal thumb size: ${manifest.length} images × ~${Math.round(manifest.reduce((sum, m) => sum, 0) / manifest.length || 15)}KB ≈ lightweight!`);
}

buildGallery().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
