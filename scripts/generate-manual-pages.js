const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manualDir = path.join(root, "docs", "manual");
const sourcePath = path.join(manualDir, "indice-maestro.md");
const source = fs.readFileSync(sourcePath, "utf8");

const chapters = [...source.matchAll(/^# (\d+)\. (.+)$/gm)].map((match, index, all) => {
  const start = match.index;
  const end = all[index + 1]?.index ?? source.length;
  return {
    number: Number(match[1]),
    title: match[2].trim(),
    body: source.slice(start, end).trim(),
  };
});

const assets = {
  1: ["../screenshots/vista-principal.png", "Vista principal del simulador Plato"],
  4: ["../assets/manual-modalidades-trap.png", "Cancha, foso, puestos y trayectorias"],
  5: ["../assets/manual-escopeta-solista.png", "Relación entre ojo, solista y punto de impacto"],
  6: ["../assets/manual-entrenamiento.png", "Errores habituales y corrección visual"],
  8: ["../assets/manual-fisica-adelanto.png", "Geometría del adelantamiento"],
  9: ["../assets/infografia-geometria-adelanto.png", "Modelo físico del punto de encuentro"],
  10: ["../screenshots/vista-completa.png", "Pantalla completa con controles y ayudas"],
  11: ["../assets/manual-modalidades-trap.png", "Modalidades y esquemas de lanzamiento"],
  12: ["../screenshots/correcciones-doble-tiro.png", "Corrección de tiro 1 y tiro 2"],
  16: ["../assets/infografia-plomeo-energia.png", "Plomeo, energía y límites del modelo"],
};

const summaries = {
  1: "Sitúa el deporte, la dificultad real de acertar a un blanco móvil y el motivo por el que existe este laboratorio visual.",
  2: "Ordena el camino de entrada en España: club, federación, formación, licencias y prudencia antes de comprar material.",
  3: "Recuerda que la técnica solo tiene sentido después de una conducta segura, supervisada y repetible.",
  4: "Explica el espacio real donde ocurre la tirada: puestos, foso, máquinas, rotación y repetición de platos.",
  5: "Describe escopetas, culatas, chokes, cartuchos y cómo cada ajuste modifica lo que ve y hace el tirador.",
  6: "Traduce los fallos típicos del principiante a causas observables: quedarse detrás, bajo, tapar el plato o parar el swing.",
  7: "Propone una progresión de aprendizaje para pasar de obedecer instrucciones a leer el plato con criterio propio.",
  8: "Explica el adelantamiento sin jerga matemática: plato, tiempo, perdigones y punto futuro de encuentro.",
  9: "Documenta el modelo físico: coordenadas, tiempo, salida del plato, plomeo, energía residual y detección de impacto.",
  10: "Convierte la interfaz del simulador en un manual de uso práctico, control por control y estado por estado.",
  11: "Compara Universal, Olímpico, Robot y variantes no normativas para entender qué cambia y qué permanece.",
  12: "Propone ejercicios concretos para entrenar con repetición, corrección, cámara lenta y lectura de errores.",
  13: "Marca los límites del modelo para usarlo con honestidad: ayuda a entender, pero no sustituye campo, profesor ni normativa.",
  14: "Explica por qué un simulador puede ahorrar cartuchos, tiempo y frustración cuando se usa con método.",
  15: "Aclara instalación, licencia MIT con atribución, reutilización y responsabilidades del proyecto.",
  16: "Reúne fuentes, glosario, preguntas frecuentes y control documental para mantener la solvencia del proyecto.",
};

function slug(number) {
  return `capitulo-${String(number).padStart(2, "0")}.html`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMd(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      closeList();
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(raw);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeList();
      out.push("<hr>");
      continue;
    }

    const h1 = line.match(/^# (\d+)\. (.+)$/);
    if (h1) {
      closeList();
      out.push(`<h1>${h1[1]}. ${inlineMd(h1[2])}</h1>`);
      continue;
    }

    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      closeList();
      out.push(`<h2>${inlineMd(h2[1])}</h2>`);
      continue;
    }

    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      closeList();
      out.push(`<h3>${inlineMd(h3[1])}</h3>`);
      continue;
    }

    const bullet = line.match(/^\* (.+)$/);
    if (bullet) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMd(bullet[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inlineMd(line.trim())}</p>`);
  }

  closeList();
  return out.join("\n");
}

function layout({ title, body, previous, next, chapter }) {
  const asset = assets[chapter.number];
  const figure = asset
    ? `<figure class="chapter-figure"><img src="${asset[0]}" alt="${asset[1]}"><figcaption>${asset[1]}</figcaption></figure>`
    : "";
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${chapter.number}. ${escapeHtml(title)} | Manual Plato</title>
  <link rel="stylesheet" href="manual.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="../../index.html"><span></span> Plato</a>
    <nav>
      <a href="../../app.html">Simulador</a>
      <a href="../../index.html#indice">Indice</a>
      <a href="indice-maestro.md">Fuente editorial</a>
    </nav>
  </header>
  <main>
    <aside class="chapter-index">
      <strong>Manual</strong>
      ${chapters.map((item) => `<a ${item.number === chapter.number ? "class=\"active\"" : ""} href="${slug(item.number)}">${item.number}. ${escapeHtml(item.title)}</a>`).join("\n      ")}
    </aside>
    <article class="chapter">
      <p class="eyebrow">Capitulo ${chapter.number} de ${chapters.length}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="summary">${summaries[chapter.number] ?? ""}</p>
      ${figure}
      <section class="reading-layers" aria-label="Capas de lectura">
        <h2>Como leer este capitulo</h2>
        <div class="layers">
          <p><strong>Tirador:</strong> busca las ideas practicas y las senales que puedes observar en cancha.</p>
          <p><strong>Simulador:</strong> relaciona cada concepto con controles, ayudas visuales y ejercicios repetibles.</p>
          <p><strong>Tecnica:</strong> usa las formulas y limites como apoyo, no como sustituto de profesor o normativa.</p>
        </div>
      </section>
      ${body}
      <nav class="chapter-nav" aria-label="Navegacion de capitulos">
        ${previous ? `<a href="${slug(previous.number)}">Anterior: ${previous.number}. ${escapeHtml(previous.title)}</a>` : "<span></span>"}
        ${next ? `<a href="${slug(next.number)}">Siguiente: ${next.number}. ${escapeHtml(next.title)}</a>` : "<span></span>"}
      </nav>
    </article>
  </main>
</body>
</html>
`;
}

for (const [index, chapter] of chapters.entries()) {
  const html = layout({
    title: chapter.title,
    body: markdownToHtml(chapter.body).replace(/<h1>.+?<\/h1>\n?/, ""),
    previous: chapters[index - 1],
    next: chapters[index + 1],
    chapter,
  });
  fs.writeFileSync(path.join(manualDir, slug(chapter.number)), html);
}

console.log(`Generados ${chapters.length} capitulos en ${path.relative(root, manualDir)}`);
