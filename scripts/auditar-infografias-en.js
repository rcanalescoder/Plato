#!/usr/bin/env node
/*
 * ¿Qué infografía sigue viéndose en castellano dentro del libro inglés?
 *
 * Existe porque la pregunta se contestaba a ojo y a ojo se falla: la edición
 * inglesa llegó a mostrar 150 láminas españolas en medio de capítulos ingleses
 * sin que ninguna comprobación lo dijera. Aquí se cruza lo que el HTML pide
 * con lo que hay en la cola de intercambio, y se dice de cada una en qué
 * estado está y quién tiene que moverla.
 *
 *   node scripts/auditar-infografias-en.js
 *   node scripts/auditar-infografias-en.js --pendientes   # sólo los ids
 */
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const libro = fs.readFileSync(path.join(raiz, "en", "index.html"), "utf8");
const cola = JSON.parse(fs.readFileSync(path.join(raiz, "exchange", "queue.json"), "utf8"));

const porId = new Map(cola.items.map(i => [i.id, i]));

// Cada <img> del libro que apunte a una infografía. La ruta dice el idioma:
// .../infografias/en/... es la inglesa, cualquier otra es la castellana.
const usadas = [];
for (const m of libro.matchAll(/src="([^"]*infografias\/[^"]*\.png)"/g)) {
  const ruta = m[1];
  const id = path.basename(ruta, ".png");
  usadas.push({ id, ruta, ingles: ruta.includes("/infografias/en/") });
}

const inglesas = usadas.filter(u => u.ingles);
const castellanas = usadas.filter(u => !u.ingles);

const filas = castellanas.map(u => {
  const item = porId.get(u.id);
  if (!item) return { ...u, estado: "SIN ENTRADA EN LA COLA", quien: "Claude" };
  if (item.copy_status !== "ready") return { ...u, estado: "falta la spec", quien: "Claude" };
  const dir = item.spec ? path.join(raiz, path.dirname(item.spec)) : null;
  const entregada = dir && fs.existsSync(path.join(dir, "state.json"));
  if (item.status === "accepted") return { ...u, estado: "aceptada pero SIN CABLEAR", quien: "Claude" };
  if (item.status === "changes_requested") return { ...u, estado: "rechazada, a regenerar", quien: "Codex" };
  if (entregada) return { ...u, estado: "entregada, esperando el gate", quien: "Claude" };
  return { ...u, estado: "pendiente de generar", quien: "Codex" };
});

if (process.argv.includes("--pendientes")) {
  filas.forEach(f => console.log(f.id));
  process.exit(filas.length ? 1 : 0);
}

console.log(`\n${usadas.length} infografías usadas en en/index.html`);
console.log(`  en inglés  : ${inglesas.length}`);
console.log(`  en español : ${castellanas.length}\n`);

const porEstado = {};
filas.forEach(f => (porEstado[`${f.quien} · ${f.estado}`] ??= []).push(f.id));
for (const clave of Object.keys(porEstado).sort()) {
  console.log(`${clave}  (${porEstado[clave].length})`);
  porEstado[clave].forEach(id => console.log(`    ${id}`));
  console.log();
}

// Una entrada de la cola que el libro no usa es trabajo que no sirve a nadie.
const usadasIds = new Set(usadas.map(u => u.id));
const huerfanas = cola.items.filter(i => !usadasIds.has(i.id)).map(i => i.id);
if (huerfanas.length) {
  console.log(`en la cola pero sin usar en el libro  (${huerfanas.length})`);
  huerfanas.forEach(id => console.log(`    ${id}`));
}

process.exit(filas.length ? 1 : 0);
