#!/usr/bin/env node
/**
 * Einmalig: Entfernt ```html ... ``` Wrapper aus allen Artikel-Contents
 * in Supabase + regeneriert die HTML-Dateien
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://fbshvqmwdidfitrigxvp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WEB_ROOT = '/var/www/microblading-entfernung.ch';

function stripCodeBlock(content) {
  return content
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('de-CH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generateHtml(article) {
  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${article.meta_title || article.title} | Microblading Entfernung</title>
  <meta name="description" content="${article.meta_description}">
  <link rel="canonical" href="https://microblading-entfernung.ch/blog/${article.slug}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap"></noscript>
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${article.title.replace(/"/g, '\\"')}",
    "description": "${article.meta_description.replace(/"/g, '\\"')}",
    "datePublished": "${new Date(article.published_at).toISOString().split('T')[0]}",
    "dateModified": "${new Date(article.published_at).toISOString().split('T')[0]}",
    "author": { "@type": "Person", "name": "Andreas Baumgärtner" },
    "publisher": { "@type": "Organization", "name": "Microblading Entfernung", "url": "https://microblading-entfernung.ch" }
  }
  <\/script>
</head>
<body>

<nav class="nav" role="navigation">
  <div class="container">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Microblading<span> Entfernung</span></a>
      <div class="nav-links">
        <a href="/picosure-laser/">PicoSure Laser</a>
        <a href="/augenbrauen-entfernung/">Augenbrauen</a>
        <a href="/permanent-makeup-entfernung/">PMU Entfernung</a>
        <a href="/preise/">Preise</a>
        <a href="/blog/">Blog</a>
        <a href="https://wa.me/41794132761?text=Hallo%2C%20ich%20m%C3%B6chte%20einen%20Termin%20vereinbaren." class="nav-cta" target="_blank" rel="noopener">💬 Termin buchen</a>
      </div>
      <button class="nav-burger" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-mobile">
    <a href="/picosure-laser/">⚡ PicoSure Laser</a>
    <a href="/augenbrauen-entfernung/">👁 Augenbrauen</a>
    <a href="/permanent-makeup-entfernung/">💋 PMU Entfernung</a>
    <a href="/preise/">💰 Preise</a>
    <a href="/faq/">❓ FAQ</a>
    <a href="/blog/">📝 Blog</a>
    <a href="https://wa.me/41794132761" class="nav-cta-mobile" target="_blank" rel="noopener">💬 WhatsApp Termin</a>
    <a href="tel:+41794132761" style="border:none;">📞 079 413 27 61</a>
  </div>
</nav>

<div class="article-header">
  <div class="container">
    <nav class="breadcrumb"><a href="/">Start</a><span class="breadcrumb-sep">›</span><a href="/blog/">Blog</a><span class="breadcrumb-sep">›</span><span>${article.title}</span></nav>
    <span class="label" style="display:block;margin-top:1.5rem;">Blog</span>
    <h1>${article.title}</h1>
    <div class="article-meta">Von Andreas Baumgärtner · ${formatDate(article.published_at)} · Lesedauer: ca. 5 Min.</div>
  </div>
</div>

<div class="article-content">
${article.content}

  <div class="article-cta-box">
    <strong>Termin vereinbaren:</strong> Schreib uns auf WhatsApp — wir antworten schnell und unverbindlich.<br>
    <a href="https://wa.me/41794132761?text=Hallo%2C%20ich%20m%C3%B6chte%20einen%20Termin%20zur%20Microblading-Entfernung." target="_blank" rel="noopener" style="color:var(--accent);font-weight:600;">→ Jetzt WhatsApp schreiben</a>
    · <a href="tel:+41794132761" style="color:var(--accent);font-weight:600;">079 413 27 61</a>
  </div>
</div>

<section style="background:var(--bg-alt);padding:3rem 0;">
  <div class="container" style="max-width:720px;text-align:center;">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem;">Microblading entfernen lassen?</h2>
    <p style="color:var(--text-muted);margin-bottom:1.5rem;">Kostenlose Erstberatung. PicoSure Laser. Kreuzlingen.</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;">
      <a href="https://wa.me/41794132761" class="btn btn-whatsapp" target="_blank" rel="noopener">💬 WhatsApp schreiben</a>
      <a href="tel:+41794132761" class="btn btn-outline">📞 079 413 27 61</a>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="footer-logo">Microblading<span> Entfernung</span></span>
        <p class="footer-desc">PicoSure® Laser Praxis in Kreuzlingen.</p>
        <div class="footer-contact-item">🇨🇭 <a href="tel:+41794132761">079 413 27 61</a></div>
        <div class="footer-contact-item">🇩🇪 <a href="tel:+4917755201800">0177 55 20 180</a></div>
      </div>
      <div class="footer-col">
        <h4>Behandlungen</h4>
        <ul>
          <li><a href="/augenbrauen-entfernung/">Microblading Entfernung</a></li>
          <li><a href="/permanent-makeup-entfernung/">PMU Entfernung</a></li>
          <li><a href="/preise/">Preise</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Info</h4>
        <ul>
          <li><a href="/faq/">FAQ</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/datenschutz/">Datenschutz</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Microblading Entfernung · Alle Rechte vorbehalten</span>
      <span><a href="/datenschutz/">Datenschutz</a> · <a href="/impressum/">Impressum</a></span>
    </div>
  </div>
</footer>
<a class="whatsapp-fab" href="https://wa.me/41794132761" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
<div class="sticky-cta">
  <a href="https://wa.me/41794132761" class="sticky-cta-wa" target="_blank" rel="noopener">💬 WhatsApp</a>
  <a href="tel:+41794132761" class="sticky-cta-tel">📞 Anrufen</a>
</div>
<script src="/js/main.js" defer><\/script>
</body>
</html>`;
}

async function main() {
  if (!SUPABASE_KEY) { console.error('SUPABASE_SERVICE_KEY fehlt'); process.exit(1); }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('is_published', true);

  if (error) { console.error('Supabase Fehler:', error.message); process.exit(1); }

  let fixed = 0;
  for (const article of articles) {
    const cleaned = stripCodeBlock(article.content);
    if (cleaned === article.content) continue; // nichts zu tun

    // Supabase aktualisieren
    const { error: updateError } = await supabase
      .from('blog_articles')
      .update({ content: cleaned })
      .eq('id', article.id);

    if (updateError) {
      console.error(`Fehler bei ${article.slug}:`, updateError.message);
      continue;
    }

    // HTML-Datei neu schreiben
    const dir = path.join(WEB_ROOT, 'blog', article.slug);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'index.html'), generateHtml({ ...article, content: cleaned }));
    }

    console.log(`✅ ${article.slug}`);
    fixed++;
  }

  console.log(`\nFertig: ${fixed} von ${articles.length} Artikeln bereinigt.`);
}

main();
