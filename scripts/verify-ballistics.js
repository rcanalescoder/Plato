#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const APP_PATH = path.join(__dirname, "..", "app.html");
const source = fs.readFileSync(APP_PATH, "utf8");

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `No se encontro function ${name}() en app.html`);
  const brace = source.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Funcion ${name} sin cierre`);
}

function extractNumericConst(name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*([0-9.]+)\\s*;`));
  assert(match, `No se encontro const ${name} numerica en app.html`);
  return Number(match[1]);
}

const params = {
  cartridge: 400,
  spread1: 30,
  spread2: 20,
  pelletVariance: 45,
  wind: 0,
  slow: 0.35
};
const sim = {
  t: 0,
  target: null,
  ribGain: 0,
  shotCount: 0,
  frozenCues: [],
  mode: "tracking"
};
const eye = { x: 0, y: 1.7, z: 0 };

const context = vm.createContext({
  assert,
  console,
  Math,
  params,
  sim,
  eye,
  g: 9.81,
  CLAY_RADIUS_M: extractNumericConst("CLAY_RADIUS_M"),
  PELLET_MASS_KG: extractNumericConst("PELLET_MASS_KG"),
  PELLET_DRAG_PER_M: extractNumericConst("PELLET_DRAG_PER_M"),
  MIN_BREAK_ENERGY_J: extractNumericConst("MIN_BREAK_ENERGY_J"),
  MAX_PELLET_FLIGHT_TIME: extractNumericConst("MAX_PELLET_FLIGHT_TIME"),
  PELLET_COLLISION_STEP: extractNumericConst("PELLET_COLLISION_STEP")
});

const functions = [
  "clamp",
  "normalize",
  "dot",
  "cross",
  "anglesToDir",
  "dirToAngles",
  "targetAt",
  "targetVelocity",
  "solveIntercept",
  "centerShotClosest",
  "recommendedAimAt",
  "spreadForShot",
  "patternRadius",
  "pelletInitialSpeed",
  "pelletTravelDistance",
  "pelletTimeToDistance",
  "pelletVelocityAt",
  "pelletEnergyAt",
  "pelletVelocityVectorAt",
  "pelletRelativeEnergyAt",
  "seededRandom",
  "pelletDirections",
  "targetDuringShot",
  "centerPelletAt",
  "shotPlanePattern",
  "closestPointOnRelativeSegment",
  "pelletHitTarget",
  "cueForShotSlot"
];

vm.runInContext(`${functions.map(extractFunction).join("\n\n")}
globalThis.ballistics = { ${functions.join(", ")} };`, context);

const b = context.ballistics;
const results = [];

function record(name, detail) {
  results.push({ name, detail });
}

function setTargetForEncounter({ offsetX = 0, speed = 300, encounterTime = 0.1 }) {
  const dir = { x: 0, y: 0, z: 1, speedScale: 1, lag: 0 };
  const travel = b.pelletTravelDistance(speed, encounterTime, dir);
  const relativeGravity = 1 - 0.42;
  sim.target = {
    visibleDelay: 0,
    p0: {
      x: offsetX,
      y: eye.y - 0.5 * 9.81 * relativeGravity * encounterTime * encounterTime,
      z: travel
    },
    v0: { x: 0, y: 0, z: 0 }
  };
  return { dir, speed };
}

// Physical contact boundary: 110 mm ISSF diameter -> 55 mm radius.
{
  const centered = setTargetForEncounter({ offsetX: 0 });
  const center = b.pelletHitTarget(centered.dir, centered.speed, 0);
  assert.equal(center.hit, true, "El disparo central debe romper con energia suficiente");

  const edgeFixture = setTargetForEncounter({ offsetX: context.CLAY_RADIUS_M });
  const edge = b.pelletHitTarget(edgeFixture.dir, edgeFixture.speed, 0);
  assert.equal(edge.hit, true, "El borde fisico de 55 mm debe contar como contacto");
  assert(edge.distance <= context.CLAY_RADIUS_M + 1e-5);

  const outsideFixture = setTargetForEncounter({ offsetX: context.CLAY_RADIUS_M + 0.001 });
  const outside = b.pelletHitTarget(outsideFixture.dir, outsideFixture.speed, 0);
  assert.equal(outside.hit, false, "Un milimetro fuera del radio fisico no debe romper");
  assert(outside.distance > context.CLAY_RADIUS_M);
  record("centro, borde y exterior", `0 mm: hit; 55 mm: hit; 56 mm: miss (min ${outside.distance.toFixed(4)} m)`);
}

// A geometric contact without enough residual energy is not a break.
{
  const fixture = setTargetForEncounter({ offsetX: 0, speed: 20, encounterTime: 0.04 });
  const weak = b.pelletHitTarget(fixture.dir, fixture.speed, 0);
  assert.equal(weak.hit, false);
  assert.equal(weak.weak, true);
  assert(weak.energy < context.MIN_BREAK_ENERGY_J);
  record("energia insuficiente", `${weak.energy.toFixed(4)} J < ${context.MIN_BREAK_ENERGY_J.toFixed(2)} J`);
}

// Residual energy and gravity impose an effective range in the current model.
{
  const speed = params.cartridge * 0.78;
  const dir = { x: 0, y: 0, z: 1, speedScale: 1, lag: 0 };
  const nearTime = b.pelletTimeToDistance(50, speed, dir);
  const farTime = b.pelletTimeToDistance(72, speed, dir);
  assert(b.pelletEnergyAt(speed, nearTime, dir) > context.MIN_BREAK_ENERGY_J);
  assert(b.pelletEnergyAt(speed, farTime, dir) < context.MIN_BREAK_ENERGY_J);
  const point = b.centerPelletAt(dir, speed, 0.1);
  assert(Math.abs(point.y - (eye.y - 0.5 * 9.81 * 0.1 ** 2)) < 1e-12);
  record(
    "alcance efectivo y caida",
    `50 m: ${b.pelletEnergyAt(speed, nearTime, dir).toFixed(2)} J; 72 m: ${b.pelletEnergyAt(speed, farTime, dir).toFixed(2)} J; caida a 0.1 s: ${(eye.y - point.y).toFixed(3)} m`
  );
}

// Shot 1 and shot 2 must use their own choke in both envelope and trajectories.
{
  const distance = 35;
  const radius1 = b.patternRadius(distance, 1);
  const radius2 = b.patternRadius(distance, 2);
  assert(radius1 > radius2, "El tiro 1 mas abierto debe tener mayor radio que el tiro 2 Full");
  const forward = { x: 0, y: 0, z: 1 };
  const dirs1 = b.pelletDirections(forward, 306, Math.atan(radius1 / distance), 123456, 0.45);
  const dirs2 = b.pelletDirections(forward, 306, Math.atan(radius2 / distance), 123456, 0.45);
  const rms = dirs => Math.sqrt(dirs.reduce((sum, dir) => sum + Math.acos(Math.max(-1, Math.min(1, dir.z))) ** 2, 0) / dirs.length);
  assert(rms(dirs1) > rms(dirs2), "El choke debe modificar tambien las trayectorias evaluadas");
  record("tiro 1 frente a tiro 2", `${radius1.toFixed(3)} m frente a ${radius2.toFixed(3)} m a 35 m`);
}

// A shot seed is deterministic; changing it changes the physical cloud.
{
  const center = { x: 0, y: 0, z: 1 };
  const a = b.pelletDirections(center, 306, 0.02, 98765, 0.45);
  const repeat = b.pelletDirections(center, 306, 0.02, 98765, 0.45);
  const different = b.pelletDirections(center, 306, 0.02, 98766, 0.45);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(repeat)));
  assert.notDeepStrictEqual(JSON.parse(JSON.stringify(a.slice(1, 8))), JSON.parse(JSON.stringify(different.slice(1, 8))));
  record("variacion sembrada", "misma semilla = misma nube; semilla distinta = nube distinta");
}

// Slow motion only changes how quickly sim.t advances on screen, never physics at a given sim.t.
{
  const fixture = setTargetForEncounter({ offsetX: 0 });
  params.slow = 0.35;
  const slow = b.pelletHitTarget(fixture.dir, fixture.speed, 0);
  const slowTarget = b.targetAt(0.1);
  params.slow = 1;
  const realtime = b.pelletHitTarget(fixture.dir, fixture.speed, 0);
  const realtimeTarget = b.targetAt(0.1);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(slow)), JSON.parse(JSON.stringify(realtime)));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(slowTarget)), JSON.parse(JSON.stringify(realtimeTarget)));
  record("camara 0.35x frente a 1.00x", "mismo estado fisico y mismo resultado al mismo tiempo simulado");
}

// Rib gain changes the physical shot elevation, not spread.
{
  sim.ribGain = 0;
  const flatRadius = b.patternRadius(35, 1);
  const flat = b.anglesToDir(0, 0);
  const gainDeg = 0.96;
  sim.ribGain = gainDeg;
  const gainedRadius = b.patternRadius(35, 1);
  const gained = b.anglesToDir(0, gainDeg * Math.PI / 180);
  assert(gained.y > flat.y);
  const measured = Math.atan2(gained.y, Math.hypot(gained.x, gained.z)) * 180 / Math.PI;
  assert(Math.abs(measured - gainDeg) < 1e-9);
  assert.equal(gainedRadius, flatRadius, "La ganancia no debe ensanchar el choke");
  record("ganancia de solista", `+${measured.toFixed(2)} grados en el eje fisico; apertura invariable`);
}

// The yellow helper must solve the same moving-target / center-pellet encounter.
{
  params.cartridge = 400;
  params.wind = 0;
  sim.ribGain = 0.48;
  sim.target = {
    visibleDelay: 0,
    p0: { x: 0, y: 0.16, z: 15 },
    v0: { x: 9.5, y: 7.8, z: 18.5 }
  };
  const shotTime = 0.42;
  const recommendation = b.recommendedAimAt(shotTime);
  assert(recommendation, "La ayuda amarilla debe existir para un plato visible");
  const poi = sim.ribGain * Math.PI / 180;
  const physicalDir = b.anglesToDir(recommendation.yaw, recommendation.pitch + poi);
  const closest = b.centerShotClosest(physicalDir, params.cartridge * 0.78, shotTime);
  assert(closest.distance <= context.CLAY_RADIUS_M, `La ayuda queda a ${closest.distance.toFixed(4)} m del plato`);
  record("interceptacion amarilla", `error central ${closest.distance.toFixed(4)} m <= ${context.CLAY_RADIUS_M.toFixed(3)} m`);
}

// Frozen panels must retrieve the exact immutable cue for each numbered shot.
{
  const cue1 = { shot: 1, shotSeed: 111, planePattern: { pellets: [{ index: 0 }] } };
  const cue2 = { shot: 2, shotSeed: 222, planePattern: { pellets: [{ index: 1 }] } };
  sim.frozenCues = [cue1, cue2];
  assert.strictEqual(b.cueForShotSlot(1), cue1);
  assert.strictEqual(b.cueForShotSlot(2), cue2);
  assert(source.includes("drawEvaluatedPattern(cue.planePattern)"), "La escena congelada debe dibujar el mismo planePattern del panel");
  assert(source.includes("energy: result.energy"), "El impacto debe conservar la energia del perdigon evaluado");
  record("tiros y marcadores congelados", "cada ranura recupera su cue y ambas vistas comparten planePattern");
}

console.log("Auditoria balistica determinista: OK");
for (const result of results) console.log(`- ${result.name}: ${result.detail}`);
