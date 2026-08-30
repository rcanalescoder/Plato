#!/usr/bin/env node

/*
 * Reproducible structural audit for the public Plato book.
 * It intentionally reads only tracked deliverables: index.html and the PNG
 * assets referenced by each subsection.
 */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const failures = [];

function fail(message) {
  failures.push(message);
}

const articles = [...html.matchAll(
  /<article class="book-section"[^>]*id="([^"]+)"[^>]*data-section="(\d+\.\d+)"[^>]*>([\s\S]*?)<\/article>/g,
)];

if (articles.length !== 220) fail(`Se encontraron ${articles.length}/220 subapartados.`);

const sectionNumbers = [];
for (const article of articles) {
  const [, id, number, block] = article;
  const [chapter, section] = number.split(".").map(Number);
  const expectedId = `s${String(chapter).padStart(2, "0")}-${String(section).padStart(2, "0")}`;
  sectionNumbers.push(number);

  if (id !== expectedId) fail(`${number}: id ${id}; se esperaba ${expectedId}.`);

  const plainText = block
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plainText ? plainText.split(" ").length : 0;
  if (words < 170) fail(`${number}: solo ${words} palabras.`);
  if (/class="[^"]*\b(?:section-sources|source-note)\b/i.test(block)) {
    fail(`${number}: conserva fuentes o notas de revisión dentro del apartado.`);
  }

  const bridges = [...block.matchAll(/class="section-bridge"/g)].length;
  if (bridges !== 1) fail(`${number}: contiene ${bridges} puentes de entrada; se esperaba uno.`);
  const headingEnd = block.indexOf("</h3>");
  const bridgeIndex = block.indexOf('class="section-bridge"');
  const leadIndex = block.indexOf('class="section-lead"');
  if (headingEnd < 0 || bridgeIndex < headingEnd || (leadIndex >= 0 && bridgeIndex > leadIndex)) {
    fail(`${number}: el puente no abre el apartado inmediatamente después del título.`);
  }

  const sectionImages = [...block.matchAll(
    /<img[^>]+src="([^"]*\/subapartados\/[^"]+\.png)"[^>]*>/g,
  )];
  if (sectionImages.length !== 1) fail(`${number}: contiene ${sectionImages.length} PNG de subapartado.`);
}

if (new Set(sectionNumbers).size !== sectionNumbers.length) fail("Hay números de subapartado duplicados.");

const bibliographyMatch = html.match(
  /<section\b[^>]*\bid="bibliografia"[^>]*>([\s\S]*?)<\/section>/i,
);
if (!bibliographyMatch) {
  fail('No existe la bibliografía final con id="bibliografia".');
} else {
  const bibliographyBlock = bibliographyMatch[1];
  const bibliographyLinks = [...bibliographyBlock.matchAll(
    /<a\s+[^>]*href="(https?:\/\/[^\"]+)"/gi,
  )].map((match) => match[1].replaceAll("&amp;", "&"));
  const uniqueBibliographyLinks = new Set(bibliographyLinks);
  if (bibliographyLinks.length < 150) {
    fail(`La bibliografía solo contiene ${bibliographyLinks.length} enlaces externos; se esperan al menos 150.`);
  }
  if (uniqueBibliographyLinks.size !== bibliographyLinks.length) {
    fail(`La bibliografía repite ${bibliographyLinks.length - uniqueBibliographyLinks.size} URL.`);
  }

  const lastChapterEnd = html.lastIndexOf('</section>', html.indexOf('id="bibliografia"'));
  const bibliographyStart = html.indexOf('id="bibliografia"');
  if (lastChapterEnd < 0 || bibliographyStart < lastChapterEnd) {
    fail('La bibliografía no aparece después de los capítulos.');
  }
}

const imageRefs = [...html.matchAll(
  /<img[^>]+src="([^"]*\/subapartados\/[^"]+\.png)"[^>]*>/g,
)].map((match) => match[1]);
if (imageRefs.length !== 220) fail(`El libro referencia ${imageRefs.length}/220 PNG de subapartado.`);
if (new Set(imageRefs).size !== imageRefs.length) fail("Hay rutas PNG reutilizadas.");

const hashes = new Map();
for (const ref of imageRefs) {
  const file = path.join(root, ref);
  if (!fs.existsSync(file)) {
    fail(`No existe ${ref}.`);
    continue;
  }
  const buffer = fs.readFileSync(file);
  if (buffer.subarray(1, 4).toString("ascii") !== "PNG") {
    fail(`${ref} no contiene una firma PNG válida.`);
    continue;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== height || width < 1000) fail(`${ref}: ${width}x${height}; debe ser cuadrada y >=1000 px.`);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  if (hashes.has(hash)) fail(`Imagen duplicada: ${ref} y ${hashes.get(hash)}.`);
  hashes.set(hash, ref);
}

const chapterSummaries = [...html.matchAll(/class="chapter-summary"/g)].length;
if (chapterSummaries < 19) fail(`Solo hay ${chapterSummaries}/19 resúmenes de capítulo.`);
if (/\.svg(?:["')\s]|$)/i.test(html)) fail("El libro referencia un SVG.");

const personalNotes = [...html.matchAll(/<aside class="personal-note">([\s\S]*?)<\/aside>/g)];
if (!personalNotes.length) fail("El libro no contiene comentarios personales diferenciados.");
for (const [, block] of personalNotes) {
  if (!/^<strong>Comentario personal\.<\/strong>/i.test(block.trim())) {
    fail("Un comentario personal no utiliza la etiqueta editorial acordada.");
  }
}
if (/(?:experiencia|observaci[oó]n|relato|consejo) (?:de|aportad[oa] por) Roberto|Roberto (?:recuerda|relata|describe|aconseja|observa|aporta|explica)/i.test(html)) {
  fail("El cuerpo del libro vuelve a hablar de la experiencia de Roberto en tercera persona.");
}

// Readability guardrail for the main prose. Sources and revision notes contain
// titles, legal names and URLs that should not be treated as normal sentences.
const proseHtml = html
  .replace(/<aside class="sidebar"[\s\S]*?<\/aside>/g, "")
  .replace(/<section\b[^>]*\bid="bibliografia"[^>]*>[\s\S]*?<\/section>/gi, "")
  .replace(/<pre[\s\S]*?<\/pre>/g, "");
const proseBlocks = [...proseHtml.matchAll(/<(p|figcaption|li|aside)\b[^>]*>([\s\S]*?)<\/\1>/g)]
  .map(([, , block]) => block
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim())
  .filter(Boolean);
const proseSentences = proseBlocks.flatMap((block) => block
  .replace(/([.!?][»”"']?)\s+(?=[A-ZÁÉÍÓÚÜÑ¿¡«“"])/g, "$1\n")
  .split("\n")
  .map((sentence) => sentence.trim().split(/\s+/).length)
  .filter((words) => words >= 4));
const sortedSentenceLengths = [...proseSentences].sort((a, b) => a - b);
const averageSentenceLength = proseSentences.reduce((sum, words) => sum + words, 0)
  / Math.max(proseSentences.length, 1);
const p95SentenceLength = sortedSentenceLengths[Math.floor((sortedSentenceLengths.length - 1) * 0.95)] ?? 0;
const sentencesOver40Words = proseSentences.filter((words) => words > 40).length;
const paragraphsOver150Words = proseBlocks.filter((block) => block.split(/\s+/).length > 150).length;

if (averageSentenceLength > 16) {
  fail(`La frase media tiene ${averageSentenceLength.toFixed(1)} palabras; el máximo editorial es 16.`);
}
if (p95SentenceLength > 30) {
  fail(`El percentil 95 alcanza ${p95SentenceLength} palabras por frase; el máximo editorial es 30.`);
}
if (sentencesOver40Words > 15) {
  fail(`Hay ${sentencesOver40Words} frases de más de 40 palabras; el máximo editorial es 15.`);
}
if (paragraphsOver150Words > 0) {
  fail(`Hay ${paragraphsOver150Words} párrafos de más de 150 palabras.`);
}

if (failures.length) {
  console.error(`AUDITORÍA DEL MANUAL: ${failures.length} fallo(s)`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `AUDITORÍA DEL MANUAL: OK · ${articles.length} subapartados · `
  + `${imageRefs.length} PNG únicos · ${chapterSummaries} resúmenes de capítulo · `
  + `${personalNotes.length} comentarios personales diferenciados · `
  + `frase media ${averageSentenceLength.toFixed(1)} palabras · P95 ${p95SentenceLength}.`,
);
