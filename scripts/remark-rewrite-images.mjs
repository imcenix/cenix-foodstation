// Remark plugin: rewrite relative image paths in restaurant markdown
// to absolute /restaurants/<slug>/ URLs that Astro serves statically.
//
// e.g. ![Photo](photos/01.jpg) in /assets/restaurants/01-pho-hai/restaurant.md
//   →  ![Photo](/restaurants/01-pho-hai/photos/01.jpg)
//
// Works the same way the portfolio site does — keeps markdown clean while
// still resolving images via the symlinked public/ folder.

import { visit } from 'unist-util-visit';

const REWRITE_ROOTS = [
  { srcPrefix: '/assets/restaurants/', publicRoot: 'restaurants' },
];

export default function remarkRewriteImages() {
  return (tree, file) => {
    const filePath = file?.path ?? '';

    // Detect which collection this file belongs to + extract its slug
    let collectionPrefix = null;
    let slug = null;

    for (const root of REWRITE_ROOTS) {
      const idx = filePath.indexOf(root.srcPrefix);
      if (idx === -1) continue;
      const rest = filePath.slice(idx + root.srcPrefix.length);
      slug = rest.split('/')[0];
      collectionPrefix = root.publicRoot;
      break;
    }

    if (!slug || !collectionPrefix) return;

    visit(tree, 'image', (node) => {
      const url = node.url ?? '';
      // Skip absolute URLs and already-rewritten ones
      if (/^(https?:)?\/\//.test(url)) return;
      if (url.startsWith('/')) return;
      // Rewrite to absolute path
      node.url = `/${collectionPrefix}/${slug}/${url}`;
    });
  };
}
