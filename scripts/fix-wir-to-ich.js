#!/usr/bin/env node
/**
 * Ersetzt alle "Wir/wir/uns/unser" durch "Ich/ich/mir/mein" auf der gesamten Website.
 * Andreas Baumgärtner spricht als Einzelperson, nicht als Team.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Geordnete Ersetzungen (längere/spezifischere zuerst)
const REPLACEMENTS = [
  // === SPEZIFISCHE PHRASEN (Hauptseiten) ===
  // index.html
  ['entfernen wir Microblading, Augenbrauen-PMU und Permanent Make-Up effektiv', 'entferne ich Microblading, Augenbrauen-PMU und Permanent Make-Up effektiv'],
  ['Unsere Spezialgebiete', 'Meine Spezialgebiete'],
  ['Was wir für dich entfernen', 'Was ich für dich entferne'],
  ['Wir sind spezialisiert auf die Entfernung von Microblading und Permanent Make-Up', 'Ich bin spezialisiert auf die Entfernung von Microblading und Permanent Make-Up'],
  ['wir entfernen alle Arten von Permanent Make-Up sicher und rückstandslos', 'ich entferne alle Arten von Permanent Make-Up sicher und rückstandslos'],
  ['behandeln wir auch Pigmentflecken', 'behandle ich auch Pigmentflecken'],
  ['wir erfüllen alle Schweizer Anforderungen', 'ich erfülle alle Schweizer Anforderungen'],
  ['Schreibe uns eine kurze Nachricht über WhatsApp oder ruf uns an', 'Schreib mir eine kurze Nachricht über WhatsApp oder ruf mich an'],
  ['Wir melden uns schnell zurück', 'Ich melde mich schnell zurück'],
  ['Wir finden gemeinsam einen passenden Termin', 'Ich finde gemeinsam einen passenden Termin'],
  ['begutachten wir das Microblading und starten direkt mit der Behandlung', 'begutachte ich das Microblading und starte direkt mit der Behandlung'],
  ['Echtes Ergebnis aus unserer Praxis in Kreuzlingen', 'Echtes Ergebnis aus meiner Praxis in Kreuzlingen'],
  ['Ergebnis aus unserer Praxis', 'Ergebnis aus meiner Praxis'],
  ['Wir informieren dich vor Behandlungsbeginn', 'Ich informiere dich vor Behandlungsbeginn'],
  ['Viele unserer Kunden', 'Viele meiner Kunden'],
  ['Viele unsere Kunden', 'Viele meiner Kunden'],
  ['Schreib uns einfach auf WhatsApp', 'Schreib mir einfach auf WhatsApp'],
  ['Schreib uns einfach', 'Schreib mir einfach'],
  ['wir antworten schnell und finden einen Termin', 'ich antworte schnell und finde einen Termin'],
  ['Schreib uns', 'Schreib mir'],

  // augenbrauen-entfernung
  ['Unsere Spezialität ist die vollständige, rückstandslose Entfernung', 'Meine Spezialität ist die vollständige, rückstandslose Entfernung'],
  ['Wir kennen die spezifischen Eigenschaften von Microblading-Pigmenten', 'Ich kenne die spezifischen Eigenschaften von Microblading-Pigmenten'],
  ['Wir beurteilen Farbe, Tiefe und Zustand des Microbladings', 'Ich beurteile Farbe, Tiefe und Zustand des Microbladings'],
  ['Wir beurteilen dies beim Ersttermin genau', 'Ich beurteile dies beim Ersttermin genau'],
  ['die wir entkräften können', 'die ich entkräften kann'],
  ['Schreib uns auf WhatsApp mit einem Foto deiner Augenbrauen', 'Schreib mir auf WhatsApp mit einem Foto deiner Augenbrauen'],
  ['Wir sagen dir sofort was möglich ist und was es kostet', 'Ich sage dir sofort was möglich ist und was es kostet'],

  // picosure-laser
  ['Warum wir ausschliesslich mit dem PicoSure arbeiten', 'Warum ich ausschliesslich mit dem PicoSure arbeite'],
  ['Unsere Zertifizierung', 'Meine Zertifizierung'],
  ['schaffen wir in 3–4', 'schaffe ich in 3–4'],
  ['Wir begutachten dein Microblading und sagen dir ehrlich wie viele Sitzungen du brauchst', 'Ich begutachte dein Microblading und sage dir ehrlich wie viele Sitzungen du brauchst'],

  // permanent-makeup-entfernung
  ['Was wir entfernen', 'Was ich entferne'],
  ['wir entfernen alle Augenbrauen-Techniken vollständig', 'ich entferne alle Augenbrauen-Techniken vollständig'],
  ['Warum wir?', 'Warum ich?'],
  ['Wir kennen diese Herausforderung', 'Ich kenne diese Herausforderung'],
  ['Bei der Erstberatung schätzen wir realistisch ein', 'Bei der Erstberatung schätze ich realistisch ein'],
  ['Wir empfehlen, mindestens 3–6 Monate nach dem PMU-Stechen zu warten', 'Ich empfehle, mindestens 3–6 Monate nach dem PMU-Stechen zu warten'],
  ['Im Augenbereich bieten wir immer eine Betäubungscreme an', 'Im Augenbereich biete ich immer eine Betäubungscreme an'],
  ['Weg mit dem PMU — wir helfen dir.', 'Weg mit dem PMU — ich helfe dir.'],
  ['Schick uns ein Foto per WhatsApp', 'Schick mir ein Foto per WhatsApp'],
  ['Wir sagen dir ehrlich was möglich ist und wie viele Sitzungen du brauchst', 'Ich sage dir ehrlich was möglich ist und wie viele Sitzungen du brauchst'],

  // preise
  ['Wir sagen dir beim ersten Termin genau, wie viele Sitzungen du brauchst', 'Ich sage dir beim ersten Termin genau, wie viele Sitzungen du brauchst'],
  ['Wir schätzen beim Erstgespräch realistisch ein', 'Ich schätze beim Erstgespräch realistisch ein'],
  ['Unser Versprechen: Keine versteckten Kosten', 'Mein Versprechen: Keine versteckten Kosten'],
  ['Unser Preis', 'Mein Preis'],
  ['Wir schätzen dein Microblading ein und sagen dir genau was es kostet', 'Ich schätze dein Microblading ein und sage dir genau was es kostet'],

  // faq
  ['Für Microblading rechnen wir typischerweise mit 3–4 Sitzungen. Das hängt von der Pigmenttiefe, der verwendeten Farbe und deinem Hauttyp ab.', 'Für Microblading rechne ich typischerweise mit 3–4 Sitzungen. Das hängt von der Pigmenttiefe, der verwendeten Farbe und deinem Hauttyp ab.'],
  ['Für Microblading rechnen wir typischerweise mit 3–4 Sitzungen. Das hängt von der Pigmenttiefe, der verwendeten Farbe und deinem individuellen Hauttyp ab.', 'Für Microblading rechne ich typischerweise mit 3–4 Sitzungen. Das hängt von der Pigmenttiefe, der verwendeten Farbe und deinem individuellen Hauttyp ab.'],
  ['Bei uns kostet eine Sitzung CHF 100. Da typischerweise 3–4 Sitzungen nötig sind, investierst du CHF 300–400 für das vollständige Ergebnis.', 'Bei mir kostet eine Sitzung CHF 100. Da typischerweise 3–4 Sitzungen nötig sind, investierst du CHF 300–400 für das vollständige Ergebnis.'],
  ['Auf Wunsch nutzen wir eine Betäubungscreme.', 'Auf Wunsch nutze ich eine Betäubungscreme.'],
  ['Deutsche Kunden erreichen uns unter 0177 55 20 180.', 'Deutsche Kunden erreichen mich unter 0177 55 20 180.'],
  ['Auf Wunsch nutzen wir eine Betäubungscreme', 'Auf Wunsch nutze ich eine Betäubungscreme'],
  ['Deutsche Kunden erreichen uns unter', 'Deutsche Kunden erreichen mich unter'],
  ['Wenn wir Betäubungscreme auftragen, kommt vorher eine Wartezeit', 'Wenn ich Betäubungscreme auftrage, kommt vorher eine Wartezeit'],
  ['die Fragen die uns am häufigsten gestellt werden', 'die Fragen die mir am häufigsten gestellt werden'],
  ['Wir haben viele Kunden aus Konstanz', 'Ich habe viele Kunden aus Konstanz'],
  ['Wir haben kein Online-Buchungssystem, weil wir jeden Fall persönlich besprechen möchten', 'Ich habe kein Online-Buchungssystem, weil ich jeden Fall persönlich besprechen möchte'],
  ['Deine Frage ist nicht dabei? Schreib uns einfach.', 'Deine Frage ist nicht dabei? Schreib mir einfach.'],
  ['Wir beantworten alle deine Fragen persönlich und schätzen dein Microblading beim Ersttermin ehrlich ein', 'Ich beantworte alle deine Fragen persönlich und schätze dein Microblading beim Ersttermin ehrlich ein'],
  ['Das müsst du wissen', 'Das musst du wissen'],

  // === ALLGEMEINERE MUSTER (kommen nach spezifischen) ===
  // "tragen wir" / "bieten wir" etc. (Verb-Inversionen)
  ['tragen wir eine betäubende Creme auf', 'trage ich eine betäubende Creme auf'],
  ['bieten wir immer eine Betäubungscreme an', 'biete ich immer eine Betäubungscreme an'],
  ['bieten wir eine Betäubungscreme an', 'biete ich eine Betäubungscreme an'],
  ['rechnen wir typischerweise mit 3–4 Sitzungen', 'rechne ich typischerweise mit 3–4 Sitzungen'],
  ['können wir eine betäubende Creme auftragen', 'kann ich eine betäubende Creme auftragen'],
  ['passen wir Wellenlänge', 'passe ich Wellenlänge'],

  // Wir-Satzanfänge
  ['Wir sind spezialisiert', 'Ich bin spezialisiert'],
  ['Wir sind:', 'Ich bin:'],
  ['Wir sind\n', 'Ich bin\n'],
  ['Wir kennen', 'Ich kenne'],
  ['Wir beurteilen', 'Ich beurteile'],
  ['Wir begutachten', 'Ich begutachte'],
  ['Wir schätzen', 'Ich schätze'],
  ['Wir empfehlen', 'Ich empfehle'],
  ['Wir erfüllen', 'Ich erfülle'],
  ['Wir finden', 'Ich finde'],
  ['Wir helfen', 'Ich helfe'],
  ['Wir sagen', 'Ich sage'],
  ['Wir informieren', 'Ich informiere'],
  ['Wir beantworten', 'Ich beantworte'],
  ['Wir antworten', 'Ich antworte'],
  ['Wir arbeiten', 'Ich arbeite'],
  ['Wir haben', 'Ich habe'],
  ['Wir melden uns', 'Ich melde mich'],
  ['wir melden uns', 'ich melde mich'],
  ['Wir entfernen', 'Ich entferne'],
  ['wir entfernen', 'ich entferne'],
  ['wir sind', 'ich bin'],
  ['wir haben', 'ich habe'],
  ['wir kennen', 'ich kenne'],
  ['wir beurteilen', 'ich beurteile'],
  ['wir begutachten', 'ich begutachte'],
  ['wir schätzen', 'ich schätze'],
  ['wir empfehlen', 'ich empfehle'],
  ['wir erfüllen', 'ich erfülle'],
  ['wir finden', 'ich finde'],
  ['wir helfen', 'ich helfe'],
  ['wir sagen', 'ich sage'],
  ['wir informieren', 'ich informiere'],
  ['wir beantworten', 'ich beantworte'],
  ['wir antworten', 'ich antworte'],
  ['wir arbeiten', 'ich arbeite'],
  ['wir beraten', 'ich berate'],
  ['wir behandeln', 'ich behandle'],
  ['wir bearbeiten', 'ich bearbeite'],
  ['wir passen', 'ich passe'],

  // Possessivpronomen
  ['Unsere Praxis', 'Meine Praxis'],
  ['unsere Praxis', 'meine Praxis'],
  ['Unsere Spezialität', 'Meine Spezialität'],
  ['unsere Spezialität', 'meine Spezialität'],
  ['Unser Versprechen', 'Mein Versprechen'],
  ['unser Versprechen', 'mein Versprechen'],
  ['Unser Preis', 'Mein Preis'],
  ['unser Preis', 'mein Preis'],
  ['Unser Angebot', 'Mein Angebot'],
  ['unsere Kunden', 'meine Kunden'],
  ['Unsere Kunden', 'Meine Kunden'],
  ['unsere Erfahrung', 'meine Erfahrung'],
  ['Unsere Erfahrung', 'Meine Erfahrung'],
  ['unsere Behandlung', 'meine Behandlung'],
  ['Unsere Behandlung', 'Meine Behandlung'],
  ['unsere Zertifizierung', 'meine Zertifizierung'],
  ['Unsere Zertifizierung', 'Meine Zertifizierung'],
  ['unsere Technologie', 'meine Technologie'],
  ['unserer Praxis', 'meiner Praxis'],
  ['unserem Angebot', 'meinem Angebot'],

  // "bei uns" → "bei mir"
  ['bei uns kostet', 'bei mir kostet'],
  ['bei uns ', 'bei mir '],

  // "uns" → "mir/mich"
  ['Schick uns', 'Schick mir'],
  ['ruf uns an', 'ruf mich an'],
  ['kontaktiere uns', 'kontaktiere mich'],
  ['erreichen uns', 'erreichen mich'],
  ['uns ein Foto', 'mir ein Foto'],
  ['uns unter', 'mich unter'],
  ['uns einfach', 'mir einfach'],
  ['uns auf WhatsApp', 'mir auf WhatsApp'],
];

// Blog-spezifische Ersetzungen (etwas allgemeiner für generierte Texte)
const BLOG_EXTRA_REPLACEMENTS = [
  ['Wir arbeiten mit dem', 'Ich arbeite mit dem'],
  ['Wir verwenden den', 'Ich verwende den'],
  ['Wir nutzen den', 'Ich nutze den'],
  ['Wir setzen auf', 'Ich setze auf'],
  ['Wir bieten', 'Ich biete'],
  ['wir bieten', 'ich biete'],
  ['Wir stehen', 'Ich stehe'],
  ['wir stehen', 'ich stehe'],
  ['Wir freuen uns', 'Ich freue mich'],
  ['wir freuen uns', 'ich freue mich'],
  ['Wir beraten', 'Ich berate'],
  ['wir beraten', 'ich berate'],
  ['Kontaktiere uns', 'Kontaktiere mich'],
  ['kontaktiere uns', 'kontaktiere mich'],
  ['unsere Klinik', 'meine Praxis'],
  ['unsere Praxis', 'meine Praxis'],
  ['unsere Behandlungen', 'meine Behandlungen'],
  ['unsere Ergebnisse', 'meine Ergebnisse'],
  ['unsere Expertise', 'meine Expertise'],
  ['unser Team', 'ich'],
  ['Unser Team', 'Ich'],
  ['unser Ziel', 'mein Ziel'],
  ['Unser Ziel', 'Mein Ziel'],
  ['wir möchten', 'ich möchte'],
  ['Wir möchten', 'Ich möchte'],
  ['uns zu besuchen', 'mich zu besuchen'],
  ['besucht uns', 'besucht mich'],
  ['Besucht uns', 'Besucht mich'],
  ['uns zu kontaktieren', 'mich zu kontaktieren'],
  ['Wir freuen', 'Ich freue'],
  ['wir freuen', 'ich freue'],
  ['uns auf euren Besuch', 'mich auf deinen Besuch'],
  ['uns auf deinen Besuch', 'mich auf deinen Besuch'],
  ['wir auf deinen Besuch', 'ich auf deinen Besuch'],
  // Kontaktformulierungen in Blogartikeln
  ['Kontaktiere uns noch heute', 'Kontaktiere mich noch heute'],
  ['Wir sind für dich da', 'Ich bin für dich da'],
  ['wir sind für dich da', 'ich bin für dich da'],
  ['rufe uns an', 'rufe mich an'],
  ['Rufe uns an', 'Rufe mich an'],
  ['schreibe uns', 'schreibe mir'],
  ['Schreibe uns', 'Schreibe mir'],
  ['uns kontaktieren', 'mich kontaktieren'],
  ['Wir helfen dir', 'Ich helfe dir'],
  ['wir helfen dir', 'ich helfe dir'],
  ['Wir begleiten dich', 'Ich begleite dich'],
  ['wir begleiten dich', 'ich begleite dich'],
  ['Wir unterstützen dich', 'Ich unterstütze dich'],
  ['wir unterstützen dich', 'ich unterstütze dich'],
];

function applyReplacements(content, replacements) {
  let result = content;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  return result;
}

function processFile(filePath, isBlog) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = applyReplacements(content, REPLACEMENTS);
  if (isBlog) {
    updated = applyReplacements(updated, BLOG_EXTRA_REPLACEMENTS);
  }
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Aktualisiert: ${filePath.replace('/var/www/microblading-entfernung.ch/', '')}`);
    return true;
  }
  return false;
}

// Alle HTML-Dateien finden
const baseDir = '/var/www/microblading-entfernung.ch';
const skipDirs = ['node_modules', '.git', 'scripts'];

function findHtmlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) continue;
      files.push(...findHtmlFiles(path.join(dir, entry.name)));
    } else if (entry.name === 'index.html') {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const allFiles = findHtmlFiles(baseDir);
let changedCount = 0;

for (const file of allFiles) {
  const isBlog = file.includes('/blog/') && file !== path.join(baseDir, 'blog/index.html');
  // Datenschutz & Impressum überspringen
  if (file.includes('/datenschutz/') || file.includes('/impressum/')) continue;
  const changed = processFile(file, isBlog);
  if (changed) changedCount++;
}

console.log(`\n📊 ${changedCount} von ${allFiles.length} Dateien aktualisiert.`);

// Zweiter Durchlauf - fehlende Blog-Muster
const BLOG_EXTRA2 = [
  ['arbeiten wir mit dem', 'arbeite ich mit dem'],
  ['setzen wir in meiner Praxis', 'setze ich in meiner Praxis'],
  ['setzen wir ein', 'setze ich ein'],
  ['nutzen wir den', 'nutze ich den'],
  ['nutzen wir ', 'nutze ich '],
  ['verwenden wir den', 'verwende ich den'],
  ['verwenden wir ', 'verwende ich '],
  ['erklären wir dir', 'erkläre ich dir'],
  ['vergleichen wir ', 'vergleiche ich '],
  ['schauen wir uns', 'schaue ich mir'],
  ['besprechen wir,', 'bespreche ich,'],
  ['besprechen wir ', 'bespreche ich '],
  ['geben wir dir', 'gebe ich dir'],
  ['bringen wir', 'bringe ich'],
  ['Melde dich bei uns', 'Melde dich bei mir'],
  ['erreichst du uns', 'erreichst du mich'],
  ['erreichst du mich telefonisch', 'erreichst du mich telefonisch'],
  ['Du erreichst uns', 'Du erreichst mich'],
  ['du uns anrufen', 'du mich anrufen'],
  ['kannst uns anrufen', 'kannst mich anrufen'],
  ['ruf uns an', 'ruf mich an'],
  ['rufe uns an', 'rufe mich an'],
  ['kontaktiere uns', 'kontaktiere mich'],
  ['zu uns ', 'zu mir '],
  ['zu uns.', 'zu mir.'],
  ['zu uns!', 'zu mir!'],
  ['zu uns,', 'zu mir,'],
  ['bei uns zahlst', 'bei mir zahlst'],
  ['bei uns.', 'bei mir.'],
  ['bei uns!', 'bei mir!'],
  ['bei uns,', 'bei mir,'],
  ['für uns ', 'für mich '],
  ['uns ist das', 'mir ist das'],
  ['uns, dass', 'mir, dass'],
  ['vertrauen uns', 'vertrauen mir'],
  ['du uns ', 'du mich '],
  ['findest du uns', 'findest du mich'],
  ['Du findest uns', 'Du findest mich'],
  ['uns in der ', 'mich in der '],
  ['uns in Kreuzlingen', 'mich in Kreuzlingen'],
  ['Warum fahren Kunden', 'Warum kommen Kunden'],
  ['fahren Kunden aus Winterthur zu uns', 'kommen Kunden aus Winterthur zu mir'],
  ['Warum wir auf PicoSure', 'Warum ich auf PicoSure'],
  ['wir auf PicoSure', 'ich auf PicoSure'],
  ['uns, weil', 'mir, weil'],
  ['uns ansehen', 'mir ansehen'],
  ['uns anschauen', 'mir anschauen'],
  ['uns kontaktieren', 'mich kontaktieren'],
  ['uns vereinbaren', 'mich vereinbaren'],
  ['vereinbaren wir', 'vereinbare ich'],
  ['uns aus der', 'mir aus der'],
  ['bewerten uns', 'bewerten mich'],
  ['Kundinnen und Kunden bewerten uns', 'Kundinnen und Kunden bewerten mich'],
  ['unsere Kunden bewerten uns', 'meine Kunden bewerten mich'],
  ['kennen wir die', 'kenne ich die'],
  ['haben wir ', 'habe ich '],
  ['haben wir.', 'habe ich.'],
  ['wir die Pigmente', 'ich die Pigmente'],
  ['wir in Kreuzlingen', 'ich in Kreuzlingen'],
  ['wir deine Situation', 'ich deine Situation'],
  ['uns freuen', 'mich freuen'],
  ['Ich freue uns', 'Ich freue mich'],
  ['uns auf dich', 'mich auf dich'],
  ['Unsere BAG-zertifizierte Praxis', 'Meine BAG-zertifizierte Praxis'],
  ['Unsere Kundinnen und Kunden', 'Meine Kunden'],
  ['unsere Kundinnen und Kunden', 'meine Kunden'],
  ['unsere 4,9', 'meine 4,9'],
  ['unsere 4.9', 'meine 4.9'],
  ['uns nicht nur Gäste', 'mich nicht nur Gäste'],
  ['Das sind nicht nur Gäste aus', 'Meine Kunden kommen nicht nur aus'],
  ['ich behandle Patienten', 'ich behandle Kunden'],
  ['Das ist nicht einfach ein Nebenprogramm für uns', 'Das ist nicht einfach ein Nebenprogramm'],
];

const allFiles2 = findHtmlFiles(baseDir);
let changedCount2 = 0;
for (const file of allFiles2) {
  if (file.includes('/datenschutz/') || file.includes('/impressum/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const updated = applyReplacements(content, BLOG_EXTRA2);
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ 2. Durchlauf: ${file.replace('/var/www/microblading-entfernung.ch/', '')}`);
    changedCount2++;
  }
}
console.log(`\n📊 2. Durchlauf: ${changedCount2} Dateien aktualisiert.`);
