// Tự sinh cover-card.jpg (ảnh thumbnail) từ cover.jpg cho mỗi quán.
// Chạy tự động trước mỗi build (prebuild). Chỉ tạo khi cover-card:
//   - thiếu, hoặc
//   - bị đen/hỏng (mọi kênh màu gần 0).
// Tránh lỗi "thumbnail đen" và khỏi phải crop tay.
import { readdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Không để lỗi sharp chặn deploy — nếu load lỗi thì bỏ qua bước này.
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (err) {
  console.warn('⚠ Bỏ qua tạo cover-card (sharp không load được):', err.message);
  process.exit(0);
}

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', 'assets', 'restaurants');
const CARD_HEIGHT = 720;
const QUALITY = 82;

async function isBlackOrBad(file) {
  try {
    const { channels } = await sharp(file).stats();
    const maxMean = Math.max(...channels.map((c) => c.mean));
    return maxMean < 12; // gần như toàn đen
  } catch {
    return true; // đọc lỗi = coi như hỏng
  }
}

const entries = await readdir(ROOT, { withFileTypes: true });
let made = 0;
for (const e of entries) {
  if (!e.isDirectory() || e.name.startsWith('_template')) continue;
  const dir = join(ROOT, e.name);
  const cover = join(dir, 'cover.jpg');
  const card = join(dir, 'cover-card.jpg');
  if (!existsSync(cover)) continue;
  const need = !existsSync(card) || (await isBlackOrBad(card));
  if (!need) continue;
  await sharp(cover)
    .resize({ height: CARD_HEIGHT })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(card + '.tmp');
  await rename(card + '.tmp', card);
  console.log(`cover-card tạo lại: ${e.name}`);
  made++;
}
console.log(made ? `✓ Đã tạo ${made} cover-card.` : '✓ Tất cả cover-card đều ổn.');
