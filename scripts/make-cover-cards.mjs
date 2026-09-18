// Tự sinh cover-card.jpg (ảnh thumbnail) từ cover.jpg cho mỗi quán.
// Chạy tự động trước mỗi build (prebuild). Chỉ tạo khi cover-card:
// CMS tạo cover-card cùng lúc với cover. Fallback này chỉ tạo khi thiếu/hỏng.
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
    return Math.max(...channels.map((channel) => channel.mean)) < 12;
  } catch {
    return true;
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
  if (existsSync(card) && !(await isBlackOrBad(card))) continue;
  await sharp(cover)
    .resize({ height: CARD_HEIGHT })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(card + '.tmp');
  await rename(card + '.tmp', card);
  console.log(`cover-card tạo lại: ${e.name}`);
  made++;
}
console.log(made ? `✓ Đã tạo ${made} cover-card.` : '✓ Tất cả cover-card đều ổn.');
