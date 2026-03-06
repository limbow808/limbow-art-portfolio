"use strict";

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const OUTPUT = path.join(ROOT, 'data', 'image-meta.json');

async function getImageMeta(filePath) {
    let aspectRatio = '1/1';
    let avgColor = '#e8e8e8';
    try {
        const m = await sharp(filePath).metadata();
        if (m.width && m.height) aspectRatio = m.width + '/' + m.height;
    } catch (e) {}
    try {
        const { data } = await sharp(filePath).resize(1, 1).raw().toBuffer({ resolveWithObject: true });
        avgColor = '#' + data[0].toString(16).padStart(2, '0') + data[1].toString(16).padStart(2, '0') + data[2].toString(16).padStart(2, '0');
    } catch (e) {}
    return { aspectRatio, avgColor };
}

async function processDir(dir) {
    const cache = {};
    if (!fs.existsSync(dir)) return cache;

    const folders = fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    for (const folder of folders) {
        const folderPath = path.join(dir, folder);

        // Process thumbnail/ subfolder
        const thumbDir = path.join(folderPath, 'thumbnail');
        if (fs.existsSync(thumbDir)) {
            const thumbFiles = fs.readdirSync(thumbDir)
                .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()));
            for (const f of thumbFiles) {
                const abs = path.join(thumbDir, f);
                const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
                cache[rel] = await getImageMeta(abs);
            }
        }

        // Process root images in folder
        const rootFiles = fs.readdirSync(folderPath)
            .filter(f => {
                if (!IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())) return false;
                try { return fs.statSync(path.join(folderPath, f)).isFile(); } catch(e) { return false; }
            });
        for (const f of rootFiles) {
            const abs = path.join(folderPath, f);
            const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
            cache[rel] = await getImageMeta(abs);
        }
    }
    return cache;
}

async function main() {
    console.log('Building image metadata cache...');
    const start = Date.now();

    const recentWork = await processDir(path.join(ROOT, 'images', 'recent-work'));
    const gallery = await processDir(path.join(ROOT, 'images', 'gallery'));

    const cache = { ...recentWork, ...gallery };
    const count = Object.keys(cache).length;

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));

    console.log(`Cached metadata for ${count} images in ${Date.now() - start}ms`);
    console.log(`Written to ${OUTPUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
