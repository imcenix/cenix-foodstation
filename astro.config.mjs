// @ts-check
import { defineConfig } from 'astro/config';
import remarkRewriteImages from './scripts/remark-rewrite-images.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://yum.imcenix.com',
  trailingSlash: 'ignore',
  build: {
    // Each page renders as /restaurant/<slug>/index.html so paths work on
    // SFTP-hosted sites without server-side URL rewriting.
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    remarkPlugins: [remarkRewriteImages],
  },
});
