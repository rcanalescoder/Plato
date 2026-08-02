#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "app.html"), "utf8");

function extractObject(name) {
  const start = html.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`No se encontro ${name}`);
  const end = html.indexOf("\n    };", start);
  if (end < 0) throw new Error(`No se pudo cerrar ${name}`);
  return Function(`return ${html.slice(html.indexOf("{", start), end + 6)}`)();
}

const FU_SCHEMES = extractObject("FU_SCHEMES");
const ISSF_SCHEMES = extractObject("ISSF_SCHEMES");
const ROBOT_SCHEMES = extractObject("ROBOT_SCHEMES");

/*
  Independent regulatory fixtures, checked 2 August 2026.

  FITASC Universal Trench 2025, official schemes on page 17:
  https://api.fitasc.com/media/2025-rglt-fu-eng-6825cd1e3ae7b895386562.pdf

  ISSF Rule Book 2026, second print 07/2026, Rules 9.8.2.3 and 9.20.2:
  https://backoffice.issf-sports.org/getfile.aspx?file=ISSF-Rule-Book-2026-Edition-2025-Second-Print-07-2026-Effective-1-July-2026.pdf&inst=455&mod=docf&pane=1

  CPSA Booklet 1 Rules 2026, Rules 27.6-27.8:
  https://www.cpsa.co.uk/files/download/2644/CPSA-Booklet-1---Rules-26.pdf

  FITASC Trap1 2025, Rules 3.1-3.3:
  https://www.fitasc.com/upload/images/reglements/2025_rglt_trap1_eng.pdf
*/
const OFFICIAL_FU = {
  fu1: [[1,35,1.5,70],[2,20,2.0,60],[3,-10,1.5,75],[4,-30,3.0,65],[5,-45,1.5,60]],
  fu2: [[1,40,2.0,65],[2,25,3.5,60],[3,5,2.5,70],[4,-15,1.5,75],[5,-35,2.0,65]],
  fu3: [[1,45,2.0,60],[2,25,2.0,75],[3,-5,3.5,60],[4,-30,2.5,65],[5,-45,1.5,70]],
  fu4: [[1,40,2.0,70],[2,15,3.5,60],[3,-5,1.5,70],[4,-30,3.0,75],[5,-35,2.5,65]],
  fu5: [[1,45,2.5,65],[2,30,3.0,60],[3,5,2.0,75],[4,-30,3.5,70],[5,-40,2.0,65]],
  fu6: [[1,40,1.5,60],[2,15,1.5,75],[3,5,2.5,65],[4,-30,2.5,65],[5,-45,3.0,60]],
  fu7: [[1,40,2.0,70],[2,15,1.5,65],[3,0,2.0,75],[4,-20,2.5,65],[5,-40,2.0,70]],
  fu8: [[1,35,2.0,75],[2,15,1.5,65],[3,0,2.5,60],[4,-20,3.0,65],[5,-45,2.5,70]],
  fu9: [[1,40,2.5,60],[2,25,2.0,70],[3,0,1.5,70],[4,-15,3.5,65],[5,-35,3.0,75]],
  fu10: [[1,35,2.0,65],[2,25,2.0,75],[3,10,3.0,60],[4,-30,2.5,70],[5,-45,2.5,60]]
};

const OFFICIAL_ISSF = {
  issf1: [[1,30,2.5],[2,10,1.5],[3,-30,3.0],[4,40,1.7],[5,-5,2.0],[6,-45,2.0],[7,45,2.0],[8,-10,3.0],[9,-45,2.8],[10,45,2.3],[11,10,1.8],[12,-40,1.6],[13,30,2.0],[14,-5,1.5],[15,-35,3.0]],
  issf2: [[1,45,2.3],[2,10,1.5],[3,-20,2.0],[4,45,1.5],[5,0,2.0],[6,-45,2.8],[7,25,2.0],[8,0,3.0],[9,-45,1.5],[10,35,2.2],[11,10,2.4],[12,-40,1.5],[13,30,2.8],[14,-10,1.5],[15,-45,2.0]],
  issf3: [[1,45,2.5],[2,0,1.6],[3,-20,3.0],[4,35,2.9],[5,-5,1.8],[6,-45,2.0],[7,35,2.5],[8,-10,3.0],[9,-40,3.0],[10,40,2.0],[11,-5,2.5],[12,-30,3.0],[13,30,2.0],[14,0,1.8],[15,-30,2.2]],
  issf4: [[1,30,1.5],[2,0,3.0],[3,-20,3.0],[4,30,2.0],[5,-10,1.5],[6,-45,2.2],[7,25,3.0],[8,-5,1.5],[9,-15,1.8],[10,40,2.8],[11,-5,1.5],[12,-35,2.2],[13,15,3.0],[14,10,3.0],[15,-40,1.7]],
  issf5: [[1,20,1.8],[2,0,3.0],[3,-25,2.6],[4,35,3.0],[5,0,1.6],[6,-35,3.0],[7,35,2.3],[8,-5,1.8],[9,-35,2.3],[10,40,3.0],[11,0,2.3],[12,-40,2.0],[13,25,1.8],[14,-5,2.5],[15,-45,1.6]],
  issf6: [[1,45,1.9],[2,0,2.8],[3,-30,3.0],[4,40,1.5],[5,0,1.6],[6,-40,2.0],[7,35,2.0],[8,0,3.0],[9,-45,2.0],[10,45,2.3],[11,5,2.0],[12,-40,3.0],[13,25,2.4],[14,0,1.75],[15,-35,1.8]],
  issf7: [[1,40,3.0],[2,0,1.5],[3,-35,1.5],[4,45,2.0],[5,5,2.2],[6,-45,3.0],[7,40,1.5],[8,5,1.9],[9,-25,2.6],[10,20,1.8],[11,0,3.0],[12,-30,3.0],[13,35,2.5],[14,0,3.0],[15,-40,2.2]],
  issf8: [[1,40,3.0],[2,-5,3.0],[3,-15,2.2],[4,30,2.0],[5,-5,2.0],[6,-35,1.8],[7,40,2.0],[8,5,1.5],[9,-35,2.5],[10,45,1.5],[11,5,2.0],[12,-25,3.0],[13,15,1.5],[14,0,1.5],[15,-45,1.6]],
  issf9: [[1,30,1.6],[2,0,1.5],[3,-15,2.0],[4,20,2.4],[5,-5,3.0],[6,-35,2.0],[7,45,2.0],[8,-5,1.5],[9,-35,1.5],[10,45,1.6],[11,0,2.8],[12,-45,2.0],[13,25,3.0],[14,5,1.5],[15,-20,3.0]],
  issf10: [[1,45,2.25],[2,0,1.75],[3,-25,2.0],[4,35,1.8],[5,0,3.0],[6,-40,2.25],[7,40,3.0],[8,5,1.8],[9,-45,3.0],[10,45,2.0],[11,-10,2.5],[12,-35,1.5],[13,15,1.8],[14,10,2.0],[15,-45,1.5]]
};

assert.deepStrictEqual(FU_SCHEMES, OFFICIAL_FU, "Las tablas Universal no coinciden fila a fila con FITASC 2025");
assert.deepStrictEqual(ISSF_SCHEMES, OFFICIAL_ISSF, "Las tablas olimpicas no coinciden fila a fila con ISSF 2026");
assert.strictEqual(Object.keys(FU_SCHEMES).length, 10, "FITASC Universal exige 10 esquemas");
assert.strictEqual(Object.keys(ISSF_SCHEMES).length, 10, "ISSF 2026 exige 10 tablas");

for (const [scheme, rows] of Object.entries(FU_SCHEMES)) {
  assert.strictEqual(rows.length, 5, `${scheme}: deben existir cinco maquinas`);
  assert.deepStrictEqual(rows.map(row => row[0]), [1, 2, 3, 4, 5], `${scheme}: numeracion de maquinas incorrecta`);
  for (const [machine, angle, height, distance] of rows) {
    assert(height >= 1.5 && height <= 3.5, `${scheme} M${machine}: altura fuera de tabla FITASC`);
    assert([60, 65, 70, 75].includes(distance), `${scheme} M${machine}: distancia no oficial`);
    if (machine <= 2) assert(angle >= 0, `${scheme} M${machine}: debe cruzar hacia la derecha`);
    if (machine >= 4) assert(angle <= 0, `${scheme} M${machine}: debe cruzar hacia la izquierda`);
  }
}

for (const [scheme, rows] of Object.entries(ISSF_SCHEMES)) {
  assert.strictEqual(rows.length, 15, `${scheme}: deben existir quince maquinas`);
  assert.deepStrictEqual(rows.map(row => row[0]), Array.from({ length: 15 }, (_, i) => i + 1), `${scheme}: numeracion de maquinas incorrecta`);
  for (let group = 0; group < 5; group += 1) {
    const groupRows = rows.slice(group * 3, group * 3 + 3);
    assert.strictEqual(groupRows.length, 3, `${scheme} grupo ${group + 1}: deben existir tres maquinas`);
  }
  for (const [machine, angle, height] of rows) {
    assert(Math.abs(angle) <= 45, `${scheme} M${machine}: angulo fuera del limite ISSF`);
    assert(height >= 1.5 && height <= 3.0, `${scheme} M${machine}: altura fuera del limite ISSF`);
  }
}

const EXPECTED_ROBOT_LIMITS = {
  robot_abt: {
    name: "ABT CPSA 2026",
    standard: "CPSA ABT 2026",
    limits: { angleMin: -30, angleMax: 30, angleTolerance: 2.5, heightMin: 1.5, heightMax: 3.5, heightTolerance: 0.1, distance: 70, distanceTolerance: 1 }
  },
  robot_trap1: {
    name: "Trap1 FITASC 2025",
    standard: "FITASC Trap1 2025",
    limits: { angleMin: -22, angleMax: 22, angleTolerance: 5, heightMin: 1.7, heightMax: 2.7, heightTolerance: 0.1, distance: 50, distanceTolerance: 2 }
  }
};

for (const [key, expected] of Object.entries(EXPECTED_ROBOT_LIMITS)) {
  const actual = ROBOT_SCHEMES[key];
  assert(actual, `Falta el perfil ${key}`);
  assert.strictEqual(actual.name, expected.name, `${key}: nombre reglamentario incorrecto`);
  assert.strictEqual(actual.standard, expected.standard, `${key}: organismo/regla incorrectos`);
  assert.strictEqual(actual.normative, true, `${key}: debe ser un perfil reglamentario`);
  assert.strictEqual(actual.sequence, "continuous", `${key}: la salida debe ser continua e impredecible`);
  assert.deepStrictEqual(actual.limits, expected.limits, `${key}: limites reglamentarios incorrectos`);
  assert.strictEqual(actual.rows, undefined, `${key}: no debe fingir una tabla discreta oficial`);
}

for (const key of ["robot_feria", "robot_extremo", "robot_random"]) {
  const scheme = ROBOT_SCHEMES[key];
  assert(scheme, `Falta el modelo ${key}`);
  assert.strictEqual(scheme.normative, false, `${key}: un preset popular no puede declararse normativo`);
  assert.match(scheme.name, /modelo/i, `${key}: la UI debe identificarlo como modelo`);
  assert.match(scheme.standard, /no normativo/i, `${key}: falta advertencia de conformidad`);
}

assert(!/then tuned|ajustad[ao]s? para/i.test(html), "Las tablas oficiales no pueden describirse como ajustadas para entrenamiento");

const g = 9.81;
const gravityFactor = g * 0.42;
const releaseHeight = 0.16;
const clayGroundY = 0.12;
const checkDistance = 10;

function solveClayLaunch(landingDistance, heightAt10) {
  const h10 = heightAt10 - releaseHeight;
  const hLand = clayGroundY - releaseHeight;
  const denominator = landingDistance * checkDistance - landingDistance * landingDistance;
  const curve = (hLand - (landingDistance / checkDistance) * h10) / denominator;
  const slope = (h10 + curve * checkDistance * checkDistance) / checkDistance;
  const horizontalSpeed = Math.sqrt(0.5 * gravityFactor / Math.max(curve, 0.0001));
  const verticalSpeed = slope * horizontalSpeed;
  return { horizontalSpeed, verticalSpeed };
}

function heightAtDistance(launch, distance) {
  const t = distance / launch.horizontalSpeed;
  return releaseHeight + launch.verticalSpeed * t - 0.5 * gravityFactor * t * t;
}

function landingDistanceFor(launch) {
  const a = 0.5 * gravityFactor;
  const b = -launch.verticalSpeed;
  const c = clayGroundY - releaseHeight;
  const disc = Math.max(0, b * b - 4 * a * c);
  const t = (-b + Math.sqrt(disc)) / (2 * a);
  return launch.horizontalSpeed * t;
}

function verifyRow({ mode, scheme, row, targetDistance, distanceTolerance }) {
  const machine = row[0];
  const heightAt10 = row[2];
  const launch = solveClayLaunch(targetDistance, heightAt10);
  const actualHeight = heightAtDistance(launch, checkDistance);
  const actualDistance = landingDistanceFor(launch);
  const heightError = Math.abs(actualHeight - heightAt10);
  const distanceError = Math.abs(actualDistance - targetDistance);
  return {
    ok: heightError <= 0.05 && distanceError <= distanceTolerance,
    label: `${mode} ${scheme} M${machine}`,
    heightAt10,
    actualHeight,
    targetDistance,
    actualDistance,
    speedKmh: Math.hypot(launch.horizontalSpeed, launch.verticalSpeed) * 3.6,
    heightError,
    distanceError
  };
}

const results = [];
for (const [scheme, rows] of Object.entries(FU_SCHEMES)) {
  for (const row of rows) results.push(verifyRow({ mode: "Universal", scheme, row, targetDistance: row[3], distanceTolerance: 5 }));
}
for (const [scheme, rows] of Object.entries(ISSF_SCHEMES)) {
  for (const row of rows) results.push(verifyRow({ mode: "Olimpico", scheme, row, targetDistance: 76, distanceTolerance: 1 }));
}

const failed = results.filter(result => !result.ok);
if (failed.length) {
  console.error("Esquemas fuera de tolerancia fisica:");
  for (const result of failed) {
    console.error(`${result.label}: h10 ${result.actualHeight.toFixed(3)} / ${result.heightAt10.toFixed(3)} m, alcance ${result.actualDistance.toFixed(2)} / ${result.targetDistance.toFixed(2)} m`);
  }
  process.exit(1);
}

const minSpeed = Math.min(...results.map(result => result.speedKmh));
const maxSpeed = Math.max(...results.map(result => result.speedKmh));
const maxHeightError = Math.max(...results.map(result => result.heightError));
const maxDistanceError = Math.max(...results.map(result => result.distanceError));

console.log("OK: tablas regulatorias comparadas fila a fila con fixtures independientes.");
console.log(`Universal FITASC: ${Object.keys(FU_SCHEMES).length} esquemas, ${Object.values(FU_SCHEMES).flat().length} filas.`);
console.log(`Foso olimpico ISSF: ${Object.keys(ISSF_SCHEMES).length} tablas, ${Object.values(ISSF_SCHEMES).flat().length} filas.`);
console.log("Robot: ABT CPSA y Trap1 FITASC separados; tres presets populares marcados no normativos.");
console.log(`Fisica interna: ${results.length} lanzamientos; velocidad de modelo ${minSpeed.toFixed(1)}-${maxSpeed.toFixed(1)} km/h.`);
console.log(`Error maximo h10: ${maxHeightError.toExponential(2)} m; alcance: ${maxDistanceError.toExponential(2)} m.`);
