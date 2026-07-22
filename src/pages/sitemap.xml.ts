import { getCollection } from 'astro:content';
const SITE = 'https://yum.imcenix.com';
const categories = ['breakfast', 'dinner', 'drinks', 'snack', 'dalat', 'cook', 'collect'];
export async function GET() {
  const entries = (await getCollection('restaurants')).filter((entry) => !entry.id.startsWith('_template'));
  const urls = [
    SITE + '/',
    ...categories.map((category) => SITE + '/' + category + '/'),
    ...entries.map((entry) => {
      const category = entry.data.category ?? (entry.data.type === 'cook' ? 'cook' : entry.data.type === 'collect' ? 'collect' : 'all');
      return SITE + '/' + category + '/' + entry.id.split('/')[0] + '/';
    }),
  ];
  const nl = String.fromCharCode(10);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => '  <url><loc>' + url + '</loc></url>'),
    '</urlset>',
  ].join(nl);
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}