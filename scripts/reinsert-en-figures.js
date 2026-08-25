#!/usr/bin/env node
/*
 * Reinserta en el libro inglés las infografías ya regeneradas en inglés.
 *
 * Las infografías llevan su texto dentro del PNG, así que la edición inglesa
 * necesita sus propios ficheros. Se regeneran fuera, en exchange/, y este
 * script las trae: copia las aceptadas a docs/.../infografias/en/ y reescribe
 * en/index.html para que apunte a ellas.
 *
 * Es idempotente y parcial a propósito: lo que todavía no esté regenerado
 * sigue apuntando al PNG español, de modo que el libro nunca queda con huecos
 * mientras dura la traducción.
 *
 *   node scripts/reinsert-en-figures.js            # reinserta
 *   node scripts/reinsert-en-figures.js --dry-run  # sólo informa
 */
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const seco = process.argv.includes("--dry-run");
const cola = path.join(raiz, "exchange", "queue.json");

if (!fs.existsSync(cola)) {
  console.error("No hay exchange/queue.json: nada que reinsertar.");
  process.exit(1);
}

const q = JSON.parse(fs.readFileSync(cola, "utf8"));
const aceptados = q.items.filter(item => item.status === "accepted");

let copiadas = 0;
let reescritas = 0;
const libro = path.join(raiz, "en", "index.html");
let html = fs.readFileSync(libro, "utf8");

for (const item of aceptados) {
  const origen = path.join(raiz, item.out);
  if (!fs.existsSync(origen)) {
    console.warn(`  ! aceptado pero sin fichero: ${item.id}`);
    continue;
  }
  // La versión inglesa vive en .../infografias/en/<misma ruta relativa>
  const rel = item.reference.replace("docs/manual-libro/assets/images/infografias/",
                                     "docs/manual-libro/assets/images/infografias/en/");
  const destino = path.join(raiz, rel);
  if (!seco) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origen, destino);
  }
  copiadas += 1;

  const viejo = `../${item.reference}`;
  const nuevo = `../${rel}`;
  if (html.includes(viejo)) {
    html = html.split(viejo).join(nuevo);
    reescritas += 1;
  }
}

if (!seco) fs.writeFileSync(libro, html);

console.log(`${aceptados.length} aceptadas · ${copiadas} copiadas · ${reescritas} referencias reescritas en en/index.html`);
const quedan = q.items.length - aceptados.length;
console.log(`${quedan} infografías siguen en español en la edición inglesa.`);
if (seco) console.log("(--dry-run: no se ha escrito nada)");
