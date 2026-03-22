#!/usr/bin/env node
/**
 * Blog Auto-Generator für microblading-entfernung.ch
 * Läuft täglich via Cron (6:00 Uhr morgens)
 * Generiert einen neuen Blog-Artikel mit Claude API
 * Speichert in Supabase + erstellt statische HTML-Datei
 */

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Config
const SUPABASE_URL = 'https://fbshvqmwdidfitrigxvp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service Role Key (nicht anon!)
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const WEB_ROOT = '/var/www/microblading-entfernung.ch';

// Artikel-Themen Pool (werden rotiert)
const ARTICLE_TOPICS = [
  { slug: 'microblading-entfernung-schmerzen', title: 'Schmerzt Microblading-Entfernung? — Was du wirklich erwarten kannst', keywords: 'microblading entfernen schmerzen, picosure laser schmerzhaft' },
  { slug: 'microblading-augenbrauen-verblasst', title: 'Microblading verblasst: Wann entfernen, wann auffrischen?', keywords: 'microblading verblasst entfernen, microblading auffrischen' },
  { slug: 'picosure-vs-qswitch-laser', title: 'PicoSure vs. Q-Switch Laser — welcher ist besser für Microblading?', keywords: 'picosure vs q-switch microblading entfernung' },
  { slug: 'microblading-vorbereitung-entfernung', title: 'Microblading-Entfernung: Das richtige Vorbereitung für beste Ergebnisse', keywords: 'microblading entfernung vorbereitung tipps' },
  { slug: 'permanent-makeup-kreuzlingen', title: 'Permanent Make-Up entfernen in Kreuzlingen — alles was Kunden aus der Schweiz wissen müssen', keywords: 'permanent makeup entfernen kreuzlingen schweiz' },
  { slug: 'microblading-entfernen-zuerich', title: 'Microblading entfernen Zürich: Warum viele Kunden nach Kreuzlingen kommen', keywords: 'microblading entfernen zürich, microblading entfernung thurgau' },
  { slug: 'augenbrauen-pmu-entfernen-tipps', title: 'Augenbrauen Permanent Make-Up entfernen — 7 Dinge die du vorher wissen solltest', keywords: 'augenbrauen pmu entfernen tipps schweiz' },
  { slug: 'microblading-narben-vermeiden', title: 'Narben nach Microblading-Entfernung — wie du sie vermeidest', keywords: 'microblading entfernung narben risiko' },
  { slug: 'microblading-entfernung-erfahrungen', title: 'Erfahrungen mit Microblading-Entfernung — was unsere Kunden berichten', keywords: 'microblading entfernung erfahrungen schweiz' },
  { slug: 'microblading-schwarz-entfernen', title: 'Schwarzes oder sehr dunkles Microblading entfernen — besondere Herausforderungen', keywords: 'schwarzes microblading entfernen picosure' },
  { slug: 'microblading-neu-stechen-nach-entfernung', title: 'Neues Microblading nach der Entfernung — wann und wie?', keywords: 'neues microblading nach entfernung schweiz' },
  { slug: 'microblading-grau-blau-entfernen', title: 'Verblasstes Microblading mit Grau-Stich entfernen', keywords: 'microblading grau blau entfernen laser' },
  { slug: 'heilungsphase-microblading-entfernung', title: 'Die Heilungsphase nach der Microblading-Entfernung Schritt für Schritt', keywords: 'heilung microblading laser behandlung' },
  { slug: 'microblading-entfernen-kosten-vergleich', title: 'Microblading-Entfernung Kosten: Ein fairer Preisvergleich für die Schweiz', keywords: 'microblading entfernen kosten schweiz vergleich' },
  { slug: 'microblading-tiefe-haut-laser', title: 'Warum sitzt Microblading so tief — und was das für die Entfernung bedeutet', keywords: 'microblading pigmenttiefe laser entfernung' },
  { slug: 'laser-entfernung-augenkontour', title: 'Eyeliner Tätowierung entfernen — Risiken rund ums Auge', keywords: 'eyeliner tattoo entfernen laser auge schweiz' },
  { slug: 'microblading-entfernen-rapperswil', title: 'Microblading entfernen Rapperswil — Anreise nach Kreuzlingen', keywords: 'microblading entfernen rapperswil kreuzlingen' },
  { slug: 'hautalterung-nach-microblading', title: 'Wie Hautalterung das Microblading verändert — und was du tun kannst', keywords: 'microblading hautalterung laser entfernung' },
  { slug: 'microblading-entfernen-frauenfeld', title: 'Microblading entfernen Frauenfeld — Thurgau Spezialist in Kreuzlingen', keywords: 'microblading entfernen frauenfeld thurgau' },
  { slug: 'pigment-allergie-microblading', title: 'Pigment-Allergie nach Microblading — was tun?', keywords: 'microblading allergie pigment entfernen schweiz' },
  { slug: 'microblading-entfernen-schaffhausen', title: 'Microblading entfernen Schaffhausen — schnell nach Kreuzlingen', keywords: 'microblading entfernen schaffhausen kreuzlingen' },
  { slug: 'pmu-korrektur-vs-entfernung', title: 'PMU Korrektur oder Entfernung — was ist besser?', keywords: 'pmu korrektur entfernung vergleich schweiz' },
  { slug: 'microblading-entfernen-romanshorn', title: 'Microblading entfernen Romanshorn — direkt am Bodensee nach Kreuzlingen', keywords: 'microblading entfernen romanshorn bodensee' },
  { slug: 'laser-entfernung-sommer-tipps', title: 'Laser-Behandlung im Sommer — was du beachten musst', keywords: 'picosure laser sommer hautpflege microblading' },
  { slug: 'haarkranzes-pmu-entfernen', title: 'Haaransatz PMU entfernen — wenn das Ergebnis nicht stimmt', keywords: 'haaransatz pmu entfernen laser kreuzlingen' },
  { slug: 'farbkorrektur-microblading-fehlgeschlagen', title: 'Farbkorrektur oder Entfernung — wenn das Microblading grün oder blau wird', keywords: 'microblading farbe korrektur gruen blau entfernen' },
  { slug: 'microblading-entfernen-arbon', title: 'Microblading entfernen Arbon — kurze Fahrt nach Kreuzlingen lohnt sich', keywords: 'microblading entfernen arbon thurgau kreuzlingen' },
  { slug: 'picosure-laser-hauttypen', title: 'PicoSure Laser und verschiedene Hauttypen — was du wissen musst', keywords: 'picosure laser hauttyp dunkel hell microblading' },
  { slug: 'microblading-entfernen-diessenhofen', title: 'Microblading entfernen Diessenhofen und Region Thurgau', keywords: 'microblading entfernen diessenhofen thurgau' },
  { slug: 'sonnenschutz-nach-laserbehandlung', title: 'Sonnenschutz nach der Laser-Behandlung — so schützt du deine Haut', keywords: 'sonnenschutz laser microblading entfernung sommer' },
  { slug: 'microblading-entfernen-weinfelden', title: 'Microblading entfernen Weinfelden — Thurgau kommt zu uns nach Kreuzlingen', keywords: 'microblading entfernen weinfelden thurgau' },
  { slug: 'kosten-picosure-vs-alternativen', title: 'PicoSure Kosten vs. günstige Alternativen — lohnt sich der Aufpreis?', keywords: 'picosure kosten vergleich laser microblading schweiz' },
  { slug: 'microblading-entfernen-konstanz-tipps', title: 'Microblading entfernen in Konstanz — oder doch lieber Kreuzlingen?', keywords: 'microblading entfernen konstanz kreuzlingen vergleich' },
  { slug: 'pmu-entfernen-lippen-erfahrung', title: 'Lippen-PMU entfernen — Erfahrungen und was du erwarten kannst', keywords: 'lippen pmu entfernen erfahrung laser kreuzlingen' },
];

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
  <title>${article.meta_title || article.title} | Microblading-Entfernung.ch</title>
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
    "publisher": { "@type": "Organization", "name": "Microblading-Entfernung.ch", "url": "https://microblading-entfernung.ch" }
  }
  <\/script>
</head>
<body>

<nav class="nav" role="navigation">
  <div class="container">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Microblading<span>-Entfernung.ch</span></a>
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
        <span class="footer-logo">Microblading<span>-Entfernung.ch</span></span>
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
      <span>© 2026 Microblading-Entfernung.ch</span>
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

async function updateSitemap(slug, date) {
  const sitemapPath = path.join(WEB_ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const newEntry = `  <url>
    <loc>https://microblading-entfernung.ch/blog/${slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${date}</lastmod>
  </url>
</urlset>`;
  sitemap = sitemap.replace('</urlset>', newEntry);
  fs.writeFileSync(sitemapPath, sitemap);
}

async function generateArticle(topic, targetDate, anthropic) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Schreibe einen SEO-optimierten Blog-Artikel auf Deutsch für die Website microblading-entfernung.ch (Praxis in Kreuzlingen, Schweiz).

Thema: "${topic.title}"
Keywords: ${topic.keywords}

Wichtige Facts:
- PicoSure® Laser von Cynosure
- Praxis: Hauptstr. 14a, 8280 Kreuzlingen
- Preis: ab CHF 100 pro Sitzung
- 3-4 Sitzungen für Microblading
- Telefon CH: 079 413 27 61
- WhatsApp: +41 79 413 27 61
- BAG-zertifiziert, V-NISSG Zertifikat
- 10+ Jahre Erfahrung, 4.9/5 Sterne
- Kunden aus ganzer Schweiz + Deutschland (Konstanz etc.)

Format:
- 600-900 Wörter
- Auf Deutsch, direkte "Du"-Ansprache
- H2 und H3 Headlines benutzen
- Praktisch, ehrlich, keine Marketing-Floskeln
- HTML-Format (nur der Body-Content, kein <html> oder <head>)
- Keyword natürlich einbauen
- Am Ende KEIN CTA - der wird automatisch hinzugefügt

Antworte NUR mit dem HTML-Content des Artikels. Keine Erklärungen.`
    }]
  });

  const content = message.content[0].text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const metaDesc = `${topic.title} — Infos vom PicoSure-Spezialisten in Kreuzlingen. Ab CHF 100 pro Sitzung.`;

  return {
    slug: topic.slug,
    title: topic.title,
    excerpt: metaDesc,
    content: content,
    meta_description: metaDesc,
    meta_title: `${topic.title} | Microblading-Entfernung.ch`,
    tags: ['microblading', 'entfernung', 'picosure', 'schweiz'],
    published_at: new Date(targetDate + 'T09:00:00').toISOString(),
    is_published: true
  };
}

async function main() {
  if (!SUPABASE_KEY || !ANTHROPIC_KEY) {
    console.error('Missing env vars: SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  // Finde das neueste Artikel-Datum in Supabase
  const { data: latest } = await supabase
    .from('blog_articles')
    .select('published_at')
    .order('published_at', { ascending: false })
    .limit(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Zieldatum: max(heute, letztes Datum + 1 Tag)
  // Wenn Artikel für die nächsten 14 Tage da sind → schreibe für Tag 15
  let targetDate;
  if (latest && latest.length > 0) {
    const lastDate = new Date(latest[0].published_at);
    lastDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);
    // Mindestens heute, damit kein Artikel in der Vergangenheit angelegt wird
    targetDate = nextDate > today ? nextDate : today;
  } else {
    targetDate = today;
  }

  const targetStr = targetDate.toISOString().split('T')[0];
  console.log(`Zieldatum für neuen Artikel: ${targetStr}`);

  // Prüfe ob für diesen Tag schon ein Artikel existiert
  const { data: existingOnDate } = await supabase
    .from('blog_articles')
    .select('id')
    .gte('published_at', targetStr + 'T00:00:00')
    .lte('published_at', targetStr + 'T23:59:59');

  if (existingOnDate && existingOnDate.length > 0) {
    console.log(`Artikel für ${targetStr} bereits vorhanden. Beende.`);
    return;
  }

  // Get published slugs to avoid duplicates
  const { data: published } = await supabase
    .from('blog_articles')
    .select('slug');
  const publishedSlugs = (published || []).map(a => a.slug);

  // Find next unpublished topic
  const available = ARTICLE_TOPICS.filter(t => !publishedSlugs.includes(t.slug));
  if (available.length === 0) {
    console.log('Alle Themen bereits veröffentlicht.');
    return;
  }

  const topic = available[0];
  console.log(`Generiere Artikel: ${topic.title} → ${targetStr}`);

  try {
    const article = await generateArticle(topic, targetStr, anthropic);

    // Save to Supabase
    const { error } = await supabase
      .from('blog_articles')
      .insert([article]);

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    // Create HTML file
    const articleDir = path.join(WEB_ROOT, 'blog', article.slug);
    fs.mkdirSync(articleDir, { recursive: true });
    fs.writeFileSync(path.join(articleDir, 'index.html'), generateHtml(article));

    // Update sitemap
    await updateSitemap(article.slug, targetStr);

    console.log(`✅ Artikel erstellt: /blog/${article.slug}/ (online: ${targetStr})`);
  } catch (err) {
    console.error('Fehler:', err.message);
    process.exit(1);
  }
}

main();
