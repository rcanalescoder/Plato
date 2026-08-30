#!/usr/bin/env node

/* Structural parity audit for the Spanish and English Plato books. */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const failures = [];
const expectedChapterOrder = [
  "fundamento",
  "empezar-espana",
  "seguridad",
  "cancha",
  "equipamiento",
  "fallos",
  "aprendizaje",
  "geometria",
  "mente",
  "preparacion-integral",
  "modalidades",
  "costes",
  "ingenieria",
  "limitaciones",
  "simulador",
  "entrenamiento",
  "licencia",
  "fuentes",
  "conclusiones-finales",
];

function fail(message) {
  failures.push(message);
}

function auditPlatoBranding(html, language) {
  const withoutExecutableBlocks = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, (block) => block.replace(/[^\n]/g, " "))
    .replace(/<style\b[\s\S]*?<\/style>/gi, (block) => block.replace(/[^\n]/g, " "));
  const stack = [];
  const voidElements = new Set(["meta", "link", "img", "br", "hr", "input"]);
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g;
  let match;

  while ((match = tokens.exec(withoutExecutableBlocks))) {
    const token = match[0];
    if (token.startsWith("</")) {
      stack.pop();
      continue;
    }
    if (token.startsWith("<")) {
      if (token.startsWith("<!--") || token.startsWith("<!")) continue;
      const name = token.match(/^<\s*([\w-]+)/)?.[1]?.toLowerCase();
      if (!name) continue;
      const className = token.match(/\bclass\s*=\s*["']([^"']*)/)?.[1] ?? "";
      if (!/\/\s*>$/.test(token) && !voidElements.has(name)) {
        stack.push({ name, className });
      }
      continue;
    }

    if (!/\bPlato\b/.test(token)) continue;
    if (stack.some(({ name }) => ["head", "code", "pre"].includes(name))) continue;
    if (stack.some(({ className }) => className.split(/\s+/).includes("plato-tool"))) continue;
    let unstyledText = token.replace(/https?:\/\/\S*Plato\S*/g, "");
    if (language === "ES") {
      unstyledText = unstyledText.replace(
        /Plato válido|Plato frontal|Plato cruzado|Plato diagonal|Plato ascendente|Plato, disparo|«Plato»/g,
        "",
      );
    }
    if (!/\bPlato\b/.test(unstyledText)) continue;

    const line = withoutExecutableBlocks.slice(0, match.index).split("\n").length;
    fail(`${language} line ${line}: an unstyled visible reference to the Plato simulator remains.`);
  }
}

function audit(relativePath, language) {
  const absolutePath = path.join(root, relativePath);
  const html = fs.readFileSync(absolutePath, "utf8");
  const articles = [...html.matchAll(
    /<article class="book-section"[^>]*id="([^"]+)"[^>]*data-section="(\d+\.\d+)"[^>]*>([\s\S]*?)<\/article>/g,
  )];
  const sections = articles.map(([, id, number]) => ({ id, number }));
  const chapterOrder = [...html.matchAll(
    /^<section\b[^>]*class="[^"]*\bbook-chapter\b[^"]*"[^>]*id="([^"]+)"[^>]*>/gm,
  )].map((match) => match[1]).filter((id) => id !== "bibliografia");
  const navigationOrder = [...html.matchAll(
    /<details class="nav-chapter"[^>]*><summary><a href="#([^"]+)"/g,
  )].map((match) => match[1]);
  const images = articles.map(([, , number, block]) => {
    const matches = [...block.matchAll(/<img[^>]+src="([^"]*\/subapartados\/[^"]+\.png)"[^>]*>/g)];
    if (matches.length !== 1) fail(`${language} ${number}: ${matches.length} subsection images.`);
    return matches[0]?.[1] ?? "";
  });

  if (articles.length !== 220) fail(`${language}: ${articles.length}/220 subsections.`);
  if (JSON.stringify(chapterOrder) !== JSON.stringify(expectedChapterOrder)) {
    fail(`${language}: chapter order is ${chapterOrder.join(" > ")}.`);
  }
  if (JSON.stringify(navigationOrder) !== JSON.stringify(expectedChapterOrder)) {
    fail(`${language}: navigation order is ${navigationOrder.join(" > ")}.`);
  }
  if (/\.svg(?:["')\s]|$)/i.test(html)) fail(`${language}: the book references an SVG.`);
  auditPlatoBranding(html, language);
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

  return { absolutePath, html, sections, images, bibliographyUrls, chapterOrder, navigationOrder };
}

const es = audit("index.html", "ES");
const en = audit("en/index.html", "EN");

const manualCss = fs.readFileSync(
  path.join(root, "docs/manual-libro/assets/css/manual.css"),
  "utf8",
);
if (!/\.plato-tool\{[^}]*color:\s*#[0-9a-f]{6}!important;[^}]*font-weight:\s*900!important/i.test(manualCss)) {
  fail("The .plato-tool style does not enforce bold green branding.");
}

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
  "https://pubmed.ncbi.nlm.nih.gov/40455784/",
  "https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2024.1476649/full",
  "https://pubmed.ncbi.nlm.nih.gov/16531911/",
  "https://link.springer.com/article/10.1007/s00180-024-01552-8",
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
  + `${es.images.length * 2} localised PNG references · sport-first chapter order · `
  + `mind and body source groups present in both books.`,
);
