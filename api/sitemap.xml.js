/**
 * Vercel Serverless Function - توليد Sitemap ديناميكي لحظي
 * يجلب المقالات من Supabase ويعيد sitemap.xml مع ترميز صحيح للروابط العربية
 */

import { createClient } from '@supabase/supabase-js';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function encodeUrl(baseUrl, path, slug) {
  const encodedSlug = encodeURIComponent(slug);
  return `${baseUrl}${path}/${encodedSlug}`;
}

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/reviews', changefreq: 'daily', priority: '0.9' },
  { path: '/theories', changefreq: 'daily', priority: '0.9' },
  { path: '/news', changefreq: 'daily', priority: '0.9' },
  { path: '/articles', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.5' },
];

export default async function handler(req, res) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VITE_SITE_URL || process.env.VITE_PUBLIC_URL || 'https://www.reviewqeem.online').replace(/\/$/, '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const urls = [];

  for (const page of STATIC_PAGES) {
    urls.push({
      loc: escapeXml(baseUrl + page.path),
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const contentTypes = [
      { table: 'news', path: '/news' },
      { table: 'reviews', path: '/reviews' },
      { table: 'theories', path: '/theories' },
      { table: 'articles', path: '/articles' },
    ];

    for (const { table, path } of contentTypes) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('slug, updated_at, published_at, created_at')
          .eq('is_published', true);

        if (!error && data) {
          for (const row of data) {
            const fullUrl = encodeUrl(baseUrl, path, row.slug);
            const lastmod = (row.updated_at || row.published_at || row.created_at)
              ? new Date(row.updated_at || row.published_at || row.created_at).toISOString().split('T')[0]
              : null;
            urls.push({
              loc: escapeXml(fullUrl),
              changefreq: 'weekly',
              priority: '0.8',
              lastmod,
            });
          }
        }
      } catch (_) {}
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
