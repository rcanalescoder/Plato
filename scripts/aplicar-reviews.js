#!/usr/bin/env node
/*
 * Lleva a queue.json el veredicto que hay escrito en cada review.md.
 *
 * El gate escribe review.md; la cola sólo la escribe Claude. Este script es
 * ese último paso, y existe porque olvidarlo es exactamente lo que dejó el
 * proyecto parado: había infografías generadas, revisadas y aceptadas que
 * nunca se marcaron, así que el reinsertador no las recogía y el libro seguía
 * mostrando la versión española.
 *
 *   node scripts/aplicar-reviews.js            # aplica
 *   node scripts/aplicar-reviews.js --dry-run  # sólo informa
 */
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const rutaCola = path.join(raiz, "exchange", "queue.json");
const cola = JSON.parse(fs.readFileSync(rutaCola, "utf8"));
const seco = process.argv.includes("--dry-run");

function carpeta(item) {
  for (const campo of ["spec", "state", "review"]) {
    if (item[campo]) {
      const d = path.join(raiz, path.dirname(item[campo]));
      if (fs.existsSync(d)) return d;
    }
  }
  // NUNCA derivar la carpeta del prefijo: 05-08 existe cuatro veces y siete
  // prefijos aparecen a la vez en subapartados/ y en extras/. Derivarlo mezcla
  // artefactos distintos, que es como se marcaron seis como aceptados leyendo
  // el review.md de otro.
  const exacta = path.join(raiz, "exchange", item.id);
  return fs.existsSync(exacta) ? exacta : null;
}

const cuenta = { aceptados: 0, cambios: 0, sin_review: 0, ilegible: 0, ya_estaba: 0, reservas_retiradas: 0 };
const cambiados = [];

for (const item of cola.items) {
  const dir = carpeta(item);
  if (!dir) { cuenta.sin_review++; continue; }
  const rr = path.join(dir, "review.md");
  if (!fs.existsSync(rr)) { cuenta.sin_review++; continue; }

  const txt = fs.readFileSync(rr, "utf8");
  // El veredicto va en negrita y en mayúsculas, al principio del review.
  const acepta = /\*\*Veredicto:\s*ACEPTADO/i.test(txt);
  const cambia = /\*\*Veredicto:\s*CAMBIOS/i.test(txt);
  if (!acepta && !cambia) { cuenta.ilegible++; continue; }

  const nuevo = acepta ? "accepted" : "changes_requested";
  if (item.status === nuevo) { cuenta.ya_estaba++; continue; }

  cambiados.push(`${item.id}: ${item.status} -> ${nuevo}`);
  item.status = nuevo;
  acepta ? cuenta.aceptados++ : cuenta.cambios++;

  /*
    Al rechazar hay que retirar la reserva del intento anterior, o el artefacto
    queda elegible pero imposible de reclamar: mkdir falla porque claim/ existe,
    y ninguna sesión de Codex puede borrar la reserva de otra. La reserva se
    archiva, no se borra: es la prueba de quién hizo cada intento.
  */
  if (cambia) {
    const claim = path.join(dir, "claim");
    if (fs.existsSync(claim)) {
      let n = 1;
      while (fs.existsSync(path.join(dir, `claim-intento-${n}`))) n++;
      fs.renameSync(claim, path.join(dir, `claim-intento-${n}`));
      cuenta.reservas_retiradas++;
    }
  }

  // Una entrega aceptada tiene spec por definición: la marca de copy_status
  // se quedaba atrás y dejaba artefactos invisibles para todo el mundo.
  if (acepta && item.copy_status !== "ready") item.copy_status = "ready";

  // El reinsertador necesita saber dónde está el PNG entregado.
  if (acepta && !item.out) {
    const st = path.join(dir, "state.json");
    if (fs.existsSync(st)) {
      try { item.out = JSON.parse(fs.readFileSync(st, "utf8")).out || item.out; } catch {}
    }
  }
}

console.log(`aceptados marcados ahora : ${cuenta.aceptados}`);
console.log(`cambios solicitados      : ${cuenta.cambios}`);
console.log(`ya estaban al día        : ${cuenta.ya_estaba}`);
console.log(`sin review.md todavía    : ${cuenta.sin_review}`);
console.log(`review.md sin veredicto  : ${cuenta.ilegible}`);
console.log(`reservas retiradas       : ${cuenta.reservas_retiradas}`);
if (cambiados.length && cambiados.length <= 40) {
  console.log();
  cambiados.forEach(c => console.log("  " + c));
}

if (seco) { console.log("\n--dry-run: no se ha escrito queue.json."); process.exit(0); }
if (cuenta.aceptados + cuenta.cambios === 0) { console.log("\nNada que cambiar."); process.exit(0); }
fs.writeFileSync(rutaCola, JSON.stringify(cola, null, 2) + "\n");
console.log("\nqueue.json actualizado.");
