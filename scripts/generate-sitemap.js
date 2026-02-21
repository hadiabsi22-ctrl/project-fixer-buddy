/**
 * سكربت توليد Sitemap الديناميكي من Supabase
 * يجلب المقالات من جداول: news, reviews, theories, articles
 * ويعالج الروابط العربية (Arabic Slugs) بشكل صحيح (URL Encoded)
 * 
 * يشغل تلقائياً وقت الـ Build عبر prebuild
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// تحميل متغيرات البيئة من .env
try {
  const fs = await import('fs');
  const pathMod = await import('path');
  const envPath = pathMod.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (_) {}

// تهريب أحرف XML الخاصة
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ترميز الرابط - يشمل الروابط العربية بشكل صحيح (RFC 3986)
function encodeUrl(baseUrl, path, slug) {
  const encodedSlug = encodeURIComponent(slug);
  return `${baseUrl}${path}/${encodedSlug}`;
}

// الصفحات الثابتة
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

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const baseUrl = (process.env.VITE_SITE_URL || process.env.VITE_PUBLIC_URL || 'https://www.reviewqeem.online').replace(/\/$/, '');

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ تحذير: Supabase credentials غير موجودة. سيتم توليد Sitemap بالصفحات الثابتة فقط.');
  }

  const urls = [];

  // إضافة الصفحات الثابتة
  for (const page of STATIC_PAGES) {
    urls.push({
      loc: escapeXml(baseUrl + page.path),
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // جلب المحتوى الديناميكي من Supabase
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

        if (error) {
          console.warn(`⚠️ خطأ في جلب ${table}:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
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
          console.log(`✓ تم جلب ${data.length} عنصر من ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️ استثناء عند جلب ${table}:`, err.message);
      }
    }
  }

  // بناء XML
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

  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, xml, 'utf-8');

  console.log(`\n✅ تم توليد Sitemap بنجاح: ${urls.length} رابط → public/sitemap.xml`);
}

main().catch((err) => {
  console.error('❌ خطأ في توليد Sitemap:', err);
  process.exit(1);
});
