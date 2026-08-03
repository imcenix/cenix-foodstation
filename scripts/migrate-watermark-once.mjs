// One-time migration: bake the approved Food Station watermark into all
// restaurant cover/gallery images. CMS handles every future upload.
import { readdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const RESTAURANTS = join(ROOT, 'assets', 'restaurants');
const WATERMARK = join(ROOT, 'assets', 'images', 'yum-imcenix-watermark.png');
const MARKER = join(ROOT, 'assets', '.foodstation-watermark-v1');
const APPLY = process.argv.includes('--apply');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

try {
  await stat(MARKER);
  throw new Error('Watermark migration v1 was already applied; refusing to add it twice.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) && entry.name !== 'cover-card.jpg') files.push(path);
  }
  return files;
}

const files = await walk(RESTAURANTS);
console.log(`${APPLY ? 'Applying to' : 'Would apply to'} ${files.length} restaurant images.`);

if (APPLY) {
  const watermark = await readFile(WATERMARK);
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const input = sharp(file).rotate();
    const metadata = await input.metadata();
    const width = metadata.width;
    const height = metadata.height;
    if (!width || !height) throw new Error(`Invalid image: ${file}`);

    const watermarkWidth = Math.min(410, Math.max(220, Math.round(width * 0.27)), Math.round(width * 0.45));
    const overlay = await sharp(watermark).resize({ width: watermarkWidth }).png().toBuffer();
    const margin = Math.max(14, Math.round(Math.min(width, height) * 0.035));
    const extension = extname(file).toLowerCase();
    let output = input.composite([{ input: overlay, gravity: 'southeast', top: height - Math.round(watermarkWidth * 485 / 788) - margin, left: width - watermarkWidth - margin }]);

    if (extension === '.png') output = output.png({ compressionLevel: 9 });
    else if (extension === '.webp') output = output.webp({ quality: 90 });
    else output = output.jpeg({ quality: 90, mozjpeg: true });

    const temporary = `${file}.watermarking`;
    await output.toFile(temporary);
    await rename(temporary, file);
    if ((index + 1) % 25 === 0 || index + 1 === files.length) console.log(`${index + 1}/${files.length}`);
  }

  await writeFile(MARKER, `Food Station watermark v1\nImages: ${files.length}\n`);
  console.log(`Completed. Marker: ${relative(ROOT, MARKER)}`);
}
