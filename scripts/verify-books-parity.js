#!/usr/bin/env node

/* Structural parity audit for the Spanish and English Plato books. */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function audit(relativePath, language) {
  const absolutePath = path.join(root, relativePath);
  const html = fs.readFileSync(absolutePath, "utf8");
  const articles = [...html.matchAll(
    /<article class="book-section"[^>]*id="([^"]+)"[^>]*data-section="(\d+\.\d+)"[^>]*>([\s\S]*?)<\/article>/g,
  )];
  const sections = articles.map(([, id, number]) => ({ id, number }));
  const images = articles.map(([, , number, block]) => {
    const matches = [...block.matchAll(/<img[^>]+src="([^"]*\/subapartados\/[^"]+\.png)"[^>]*>/g)];
    if (matches.length !== 1) fail(`${language} ${number}: ${matches.length} subsection images.`);
    return matches[0]?.[1] ?? "";
  });

  if (articles.length !== 226) fail(`${language}: ${articles.length}/226 subsections.`);
  if (/\.svg(?:["')\s]|$)/i.test(html)) fail(`${language}: the book references an SVG.`);
  const conclusion = html.match(
    /<section class="chapter book-chapter final-conclusions"[\s\S]*?<p class="chapter-kicker">([^<]+)<\/p>/,
  );
  if (!conclusion || !/19$/.test(conclusion[1])) {
    fail(`${language}: final conclusions are not Chapter 19.`);
  }

  const bibliography = html.match(/<section\b[^>]*id="bibliografia"[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? "";
  const bibliographyUrls = [...bibliography.matchAll(/href="(https?:\/\/[^\"]+)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"));
  if (bibliographyUrls.length !== new Set(bibliographyUrls).size) {
    fail(`${language}: bibliography contains duplicate URLs.`);
  }

  return { absolutePath, html, sections, images, bibliographyUrls };
}

const es = audit("index.html", "ES");
const en = audit("en/index.html", "EN");

for (let index = 0; index < Math.max(es.sections.length, en.sections.length); index += 1) {
  const esSection = es.sections[index];
  const enSection = en.sections[index];
  if (JSON.stringify(esSection) !== JSON.stringify(enSection)) {
    fail(`Section ${index + 1}: ES ${JSON.stringify(esSection)} != EN ${JSON.stringify(enSection)}.`);
  }

  const esImage = es.images[index] ?? "";
  const enImage = en.images[index] ?? "";
  if (path.basename(esImage) !== path.basename(enImage)) {
    fail(`Image pair ${index + 1}: ${esImage} != ${enImage}.`);
  }
  if (esImage.includes("/en/")) fail(`ES image incorrectly uses /en/: ${esImage}.`);
  if (enImage && !enImage.includes("/en/")) fail(`EN image is not localised: ${enImage}.`);

  for (const [book, relativeImage, bookPath] of [
    ["ES", esImage, es.absolutePath],
    ["EN", enImage, en.absolutePath],
  ]) {
    if (!relativeImage) continue;
    const imagePath = path.resolve(path.dirname(bookPath), relativeImage);
    if (!fs.existsSync(imagePath)) {
      fail(`${book}: missing ${relativeImage}.`);
      continue;
    }
    const buffer = fs.readFileSync(imagePath);
    if (buffer.subarray(1, 4).toString("ascii") !== "PNG") {
      fail(`${book}: ${relativeImage} does not have a PNG signature.`);
      continue;
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width !== height || width < 1000) {
      fail(`${book}: ${relativeImage} is ${width}x${height}; expected square and >=1000 px.`);
    }
  }
}

const requiredPsychologySources = [
  "https://doi.org/10.1016/j.psychsport.2011.07.007",
  "https://doi.org/10.1249/MSS.0b013e3181d1b059",
  "https://doi.org/10.1249/MSS.0b013e3182035de6",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC8123879/",
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9928995/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC3307964/",
  "https://pubmed.ncbi.nlm.nih.gov/41951087/",
  "https://pubmed.ncbi.nlm.nih.gov/42271117/",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC12838017/",
  "https://pubmed.ncbi.nlm.nih.gov/23211179/",
];

const requiredBodyAndCompetitionSources = [
  "https://doi.org/10.14198/jhse.2018.133.06",
  "https://doi.org/10.7752/jpes.2021.s6444",
  "https://doi.org/10.1016/j.orthtr.2026.05.001",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6926526/",
  "https://pubmed.ncbi.nlm.nih.gov/19996770/",
  "https://doi.org/10.1136/bjsports-2020-102025",
  "https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf",
  "https://api.fitasc.com/media/2025-rglt-cs-eng-6825ccbed2a18275696578.pdf",
  "https://api.fitasc.com/media/20260203-rglt-pc-eng-69c6aa08dfdfc995043715.pdf",
];

for (const url of requiredPsychologySources) {
  if (!es.bibliographyUrls.includes(url)) fail(`ES bibliography lacks ${url}.`);
  if (!en.bibliographyUrls.includes(url)) fail(`EN bibliography lacks ${url}.`);
}

for (const url of requiredBodyAndCompetitionSources) {
  if (!es.bibliographyUrls.includes(url)) fail(`ES bibliography lacks ${url}.`);
  if (!en.bibliographyUrls.includes(url)) fail(`EN bibliography lacks ${url}.`);
}

if (failures.length) {
  console.error(`BILINGUAL PARITY: ${failures.length} failure(s)`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `BILINGUAL PARITY: OK · ${es.sections.length} paired sections · `
  + `${es.images.length * 2} localised PNG references · chapter 17 and 18 sources present in both books.`,
);
