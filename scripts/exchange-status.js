#!/usr/bin/env node
/*
 * Estado del canal de intercambio de infografías, en un solo comando.
 *
 * Existe porque calcular "qué me toca" obligaba a cruzar queue.json con el
 * sistema de ficheros artefacto por artefacto, y una sesión de Codex se pasó
 * un turno entero auditando rutas para acabar descubriendo que no le tocaba
 * nada. La elegibilidad es una función de datos: que la calcule una máquina.
 *
 *   node scripts/exchange-status.js            # resumen para humanos
 *   node scripts/exchange-status.js --next     # un id elegible, o nada
 *   node scripts/exchange-status.js --eligible # todos los elegibles, uno por línea
 *   node scripts/exchange-status.js --json     # todo, en JSON
 *
 * Códigos de salida:
 *   0  hay trabajo elegible
 *   3  no hay trabajo elegible y todo está entregado: le toca al gate de Claude
 *   4  no hay trabajo elegible porque faltan specs: espera y reintenta
 */
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const cola = JSON.parse(fs.readFileSync(path.join(raiz, "exchange", "queue.json"), "utf8"));

// La carpeta de un artefacto es la que dan los campos de la cola. Si no los
// trae, se prueba el id completo y luego su prefijo, en ese orden.
function carpeta(item) {
  for (const campo of ["spec", "state", "claim", "review", "out"]) {
    if (item[campo]) return path.join(raiz, path.dirname(item[campo]).replace(/\/(out|claim)$/, ""));
  }
  // NUNCA derivar la carpeta del prefijo: 05-08 existe cuatro veces y siete
  // prefijos aparecen a la vez en subapartados/ y en extras/. Derivarlo mezcla
  // artefactos distintos, que es como se marcaron seis como aceptados leyendo
  // el review.md de otro.
  const exacta = path.join(raiz, "exchange", item.id);
  return fs.existsSync(exacta) ? exacta : null;
}

const existe = p => p && fs.existsSync(p);
const leerJSON = p => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

const informe = { elegibles: [], reclamados: [], esperando_gate: [], con_incidencia: [], sin_spec: [], aceptados: [], sin_carpeta: [], reservas_caducadas: [] };

for (const item of cola.items) {
  const dir = carpeta(item);
  if (!dir || !fs.existsSync(dir)) { informe.sin_carpeta.push(item.id); continue; }

  const estado = leerJSON(path.join(dir, "state.json"));
  const reclamado = existe(path.join(dir, "claim"));

  if (item.status === "accepted") { informe.aceptados.push(item.id); continue; }
  if (item.copy_status !== "ready") { informe.sin_spec.push(item.id); continue; }

  if (estado) {
    /*
      Cuando la cola dice changes_requested hay dos situaciones muy distintas, y
      confundirlas deja trabajo invisible durante horas:

      · el rechazo es la última palabra -> hay que rehacerlo: es elegible;
      · Codex ya ha vuelto a entregar después del rechazo -> le toca al gate.

      Lo dice quién escribió más tarde. review.md sólo lo escribe Claude y
      state.json sólo lo escribe Codex, así que comparar sus fechas dice de
      quién es el turno sin necesidad de ningún campo extra.

      La primera versión de esta regla no miraba la fecha y mandaba a elegibles
      cualquier changes_requested. Resultado: Codex regeneró veintinueve
      láminas y el informe siguió diciendo "0 esperando el gate" durante cinco
      horas.
    */
    if (item.status === "changes_requested") {
      const rev = path.join(dir, "review.md");
      const st = path.join(dir, "state.json");
      const reentregado = existe(rev) &&
        fs.statSync(st).mtimeMs > fs.statSync(rev).mtimeMs;
      if (!reentregado) { informe.elegibles.push(item.id); continue; }
    }
    if (estado.status === "delivered_with_issue") informe.con_incidencia.push(item.id);
    else if (estado.status === "blocked") informe.elegibles.push(item.id);
    else informe.esperando_gate.push(item.id);
    continue;
  }

  if (reclamado) {
    // El claim de un intento anterior no reserva el reintento.
    if (item.status === "changes_requested") { informe.elegibles.push(item.id); continue; }
    const edadMin = (Date.now() - fs.statSync(path.join(dir, "claim")).mtimeMs) / 60000;
    if (edadMin > 45) informe.reservas_caducadas.push({ id: item.id, minutos: Math.round(edadMin) });
    else informe.reclamados.push(item.id);
    continue;
  }

  informe.elegibles.push(item.id);
}

// Una reserva caducada vuelve a estar disponible: se puede robar.
const disponibles = informe.elegibles.concat(informe.reservas_caducadas.map(r => r.id));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ...informe, disponibles }, null, 1));
} else if (process.argv.includes("--eligible")) {
  disponibles.forEach(id => console.log(id));
} else if (process.argv.includes("--next")) {
  if (disponibles.length) console.log(disponibles[0]);
} else {
  const f = (etiqueta, n) => console.log(`  ${etiqueta.padEnd(38)} ${String(n).padStart(4)}`);
  console.log(`\n${cola.items.length} artefactos en la cola\n`);
  f("ELEGIBLES para Codex ahora mismo", disponibles.length);
  f("reservados por otra sesión", informe.reclamados.length);
  f("entregados, esperando el gate de Claude", informe.esperando_gate.length);
  f("entregados con incidencia (los ve Claude)", informe.con_incidencia.length);
  f("sin spec todavía (los escribe Claude)", informe.sin_spec.length);
  f("aceptados y cerrados", informe.aceptados.length);
  if (informe.sin_carpeta.length) f("sin carpeta en exchange/", informe.sin_carpeta.length);
  if (informe.reservas_caducadas.length) f("reservas caducadas, robables", informe.reservas_caducadas.length);
  console.log();
  if (!disponibles.length) {
    if (informe.esperando_gate.length + informe.con_incidencia.length > 0) {
      console.log("  No hay trabajo de generación. El cuello de botella es el gate de Claude.");
      console.log("  Una sesión de Codex debe PARAR aquí y decirlo. No reintentes.\n");
    } else {
      console.log("  No hay trabajo porque faltan specs. Espera y vuelve a mirar.\n");
    }
  }
}

process.exit(disponibles.length ? 0 : (informe.esperando_gate.length + informe.con_incidencia.length > 0 ? 3 : 4));
