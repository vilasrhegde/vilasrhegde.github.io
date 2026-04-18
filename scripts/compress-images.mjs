import sharp from 'sharp';
import { readdir, rename, unlink, stat, copyFile } from 'fs/promises';
import path from 'path';

const dir = './images/photography';

async function compressImages() {
    console.log('Compressing images in', dir, '...\n');
    const files = await readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();
        const stats = await stat(filePath);
        const sizeKB = Math.round(stats.size / 1024);

        try {
            if (ext === '.jpg' || ext === '.jpeg' || ext === '.heic' || ext === '.heif') {
                // Convert to WebP
                const outPath = filePath.replace(/\.(jpg|jpeg|heic|heif)$/i, '.webp');
                await sharp(filePath)
                    .rotate() // Auto-orient based on EXIF
                    .resize(1920, null, { withoutEnlargement: true })
                    .webp({ quality: 75 })
                    .toFile(outPath);
                const newStats = await stat(outPath);
                const newSizeKB = Math.round(newStats.size / 1024);
                console.log(`  ✓ ${file} (${sizeKB}KB) → ${path.basename(outPath)} (${newSizeKB}KB) — saved ${Math.round((1 - newSizeKB / sizeKB) * 100)}%`);
                // Try to delete original, ignore if busy
                try { await unlink(filePath); } catch (e) { console.log(`    (could not delete ${file}, delete manually)`); }
            } else if (ext === '.webp' && stats.size > 100 * 1024) {
                // Re-compress large WebP files — write to new file, then swap
                const outPath = filePath.replace('.webp', '_compressed.webp');
                await sharp(filePath)
                    .rotate() // Auto-orient based on EXIF
                    .resize(1920, null, { withoutEnlargement: true })
                    .webp({ quality: 75 })
                    .toFile(outPath);
                const newStats = await stat(outPath);
                const newSizeKB = Math.round(newStats.size / 1024);

                // Swap: delete original, rename compressed
                try {
                    await unlink(filePath);
                    await rename(outPath, filePath);
                } catch (e) {
                    // If original is locked, keep compressed version alongside
                    console.log(`    (swap failed — compressed saved as ${path.basename(outPath)})`);
                }
                console.log(`  ✓ ${file} (${sizeKB}KB) → (${newSizeKB}KB) — saved ${Math.round((1 - newSizeKB / sizeKB) * 100)}%`);
            } else {
                console.log(`  — ${file} (${sizeKB}KB) — skipped`);
            }
        } catch (err) {
            console.log(`  ✗ ${file} — error: ${err.message}`);
        }
    }

    console.log('\n✓ Image compression complete!');
}

compressImages().catch(err => {
    console.error('Compression failed:', err);
    process.exit(1);
});
