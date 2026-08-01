#!/usr/bin/env node

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
  const ok = heightError <= 0.05 && distanceError <= distanceTolerance;
  return {
    ok,
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
  for (const row of rows) {
    results.push(verifyRow({
      mode: "Universal",
      scheme,
      row,
      targetDistance: row[3],
      distanceTolerance: 5
    }));
  }
}

for (const [scheme, rows] of Object.entries(ISSF_SCHEMES)) {
  for (const row of rows) {
    results.push(verifyRow({
      mode: "Olimpico",
      scheme,
      row,
      targetDistance: 76,
      distanceTolerance: 1
    }));
  }
}

const failed = results.filter(result => !result.ok);
if (failed.length) {
  console.error("Esquemas fuera de tolerancia:");
  for (const result of failed) {
    console.error(`${result.label}: h10 ${result.actualHeight.toFixed(3)} / ${result.heightAt10.toFixed(3)} m, alcance ${result.actualDistance.toFixed(2)} / ${result.targetDistance.toFixed(2)} m`);
  }
  process.exit(1);
}

const minSpeed = Math.min(...results.map(result => result.speedKmh));
const maxSpeed = Math.max(...results.map(result => result.speedKmh));
const maxHeightError = Math.max(...results.map(result => result.heightError));
const maxDistanceError = Math.max(...results.map(result => result.distanceError));

console.log(`OK: ${results.length} lanzamientos verificados.`);
console.log(`Velocidad inicial: ${minSpeed.toFixed(1)}-${maxSpeed.toFixed(1)} km/h.`);
console.log(`Error maximo h10: ${maxHeightError.toExponential(2)} m.`);
console.log(`Error maximo alcance: ${maxDistanceError.toExponential(2)} m.`);
