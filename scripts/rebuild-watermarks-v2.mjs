// Correct v1: restore pristine photos from the commit before watermarking,
// orient them first, then add exactly one proportional watermark.
import { execFileSync } from 'node:child_process';
import { readdir, writeFile, rename } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const RESTAURANTS = join(ROOT, 'assets', 'restaurants');
const WATERMARK = await sharp(join(ROOT, 'assets', 'images', 'yum-imcenix-watermark.png')).png().toBuffer();
const ORIGINAL_COMMIT = 'fb02cc8^';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) && entry.name !== 'cover-card.jpg') files.push(path);
  }
  return files;
}

async function addWatermark(inputBuffer, outputPath, card = false) {
  let base = sharp(inputBuffer).rotate();
  if (card) base = base.resize({ width: 850, height: 720, fit: 'cover', position: 'centre' });
  const oriented = await base.toBuffer();
  const metadata = await sharp(oriented).metadata();
  const width = metadata.width;
  const height = metadata.height;
  if (!width || !height) throw new Error(`Invalid image: ${outputPath}`);

  const watermarkWidth = Math.round(width * 0.30);
  const overlay = await sharp(WATERMARK).resize({ width: watermarkWidth }).png().toBuffer();
  const overlayHeight = (await sharp(overlay).metadata()).height;
  const margin = Math.max(14, Math.round(Math.min(width, height) * 0.035));
  const extension = extname(outputPath).toLowerCase();
  let output = sharp(oriented).composite([{
    input: overlay,
    left: width - watermarkWidth - margin,
    top: height - overlayHeight - margin,
  }]);
  if (card || extension === '.jpg' || extension === '.jpeg') output = output.jpeg({ quality: 90, mozjpeg: true });
  else if (extension === '.png') output = output.png({ compressionLevel: 9 });
  else output = output.webp({ quality: 90 });
  const temporary = `${outputPath}.v2`;
  await output.toFile(temporary);
  await rename(temporary, outputPath);
}

const files = await walk(RESTAURANTS);
for (let index = 0; index < files.length; index += 1) {
  const file = files[index];
  const repoPath = relative(ROOT, file);
  const original = execFileSync('git', ['show', `${ORIGINAL_COMMIT}:${repoPath}`], { cwd: ROOT, maxBuffer: 50 * 1024 * 1024 });
  await addWatermark(original, file);
  const relativeParts = relative(RESTAURANTS, file).split('/');
  if (relativeParts.length === 2 && /^cover\.jpg$/i.test(relativeParts[1])) {
    await addWatermark(original, join(dirname(file), 'cover-card.jpg'), true);
  }
  if ((index + 1) % 25 === 0 || index + 1 === files.length) console.log(`${index + 1}/${files.length}`);
}

await writeFile(join(ROOT, 'assets', '.foodstation-watermark-v2'), `Food Station watermark v2\nImages: ${files.length}\nWidth: 30% after orientation\n`);
