#!/usr/bin/env node
/**
 * Sitemap-Generator für microblading-entfernung.ch
 * Liest alle veröffentlichten Artikel aus Supabase
 * und regeneriert sitemap.xml vollständig.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://fbshvqmwdidfitrigxvp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WEB_ROOT = '/var/www/microblading-entfernung.ch';

const STATIC_PAGES = [
  { loc: 'https://microblading-entfernung.ch/',                        changefreq: 'weekly',  priority: '1.0', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/picosure-laser/',         changefreq: 'monthly', priority: '0.9', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/augenbrauen-entfernung/', changefreq: 'monthly', priority: '0.9', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/permanent-makeup-entfernung/', changefreq: 'monthly', priority: '0.9', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/preise/',                 changefreq: 'monthly', priority: '0.8', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/faq/',                    changefreq: 'monthly', priority: '0.8', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/blog/',                   changefreq: 'daily',   priority: '0.8', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/datenschutz/',            changefreq: 'yearly',  priority: '0.3', lastmod: '2026-03-22' },
  { loc: 'https://microblading-entfernung.ch/impressum/',              changefreq: 'yearly',  priority: '0.3', lastmod: '2026-03-22' },
];

function toEntry({ loc, changefreq, priority, lastmod }) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

async function main() {
  if (!SUPABASE_KEY) {
    console.error('Fehler: SUPABASE_SERVICE_KEY fehlt');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Alle Artikel aus Supabase laden (auch zukünftige — sie sollen in der Sitemap sein)
  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Supabase Fehler:', error.message);
    process.exit(1);
  }

  const staticEntries = STATIC_PAGES.map(toEntry).join('\n');

  const blogEntries = articles.map(a => {
    const lastmod = a.published_at.split('T')[0];
    return toEntry({
      loc: `https://microblading-entfernung.ch/blog/${a.slug}/`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod
    });
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticEntries}
${blogEntries}
</urlset>`;

  fs.writeFileSync(path.join(WEB_ROOT, 'sitemap.xml'), sitemap);
  console.log(`✅ sitemap.xml aktualisiert — ${articles.length} Blog-Artikel + ${STATIC_PAGES.length} statische Seiten`);
}

main();
