// Symlink `assets/restaurants` and `assets/images` into `public/` so
// Astro can serve them as static files at:
//   /restaurants/<slug>/cover.jpg
//   /restaurants/<slug>/photos/<file>
//   /images/<file>
//
// Runs automatically before `npm run dev` and `npm run build`.

import { symlink, rm, mkdir, cp, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC = path.join(ROOT, 'public');

const targets = [
  { from: path.join(ASSETS, 'restaurants'), to: path.join(PUBLIC, 'restaurants') },
  { from: path.join(ASSETS, 'images'),      to: path.join(PUBLIC, 'images')      },
];

await mkdir(PUBLIC, { recursive: true });

for (const { from, to } of targets) {
  try {
    await stat(from);
  } catch {
    console.warn(`Skipping: ${path.relative(ROOT, from)} does not exist`);
    continue;
  }

  await rm(to, { recursive: true, force: true });

  try {
    await symlink(from, to, 'dir');
    console.log(`Linked: ${path.relative(ROOT, to)} -> ${path.relative(ROOT, from)}`);
  } catch (err) {
    await cp(from, to, { recursive: true });
    console.log(`Copied: ${path.relative(ROOT, from)} -> ${path.relative(ROOT, to)}`);
  }
}
