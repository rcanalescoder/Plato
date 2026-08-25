# Plato

*Léelo en [castellano](README.md).*

A 3D HTML simulator for studying clay target shooting from the shooter's real eye-level perspective. The aim is not to invent an abstract game, but to build a visual laboratory of applied physics: clay release, velocity, angle, human response, lead, cartridge spread and correction after the first and second shot.

Built by **Roberto Canales Mora**: [robertocanales.com/proyectos#plato](https://robertocanales.com/proyectos#plato). Licence: [MIT](#14-licence).

The application runs as a self-contained HTML page (`app.html`) and renders the scene with `canvas`, with no external dependencies. It is designed to iterate quickly on the physics and the visual representation before turning it, if that goes ahead, into a full game or a VR experience.

**Cover, manual and documentation:** <a href="en/index.html" target="_blank" rel="noopener">open Plato's English book</a>. The published root (`en/index.html`) is the single documentation source: it opens with a large link to the simulator, shows a real screenshot of a released clay and brings together the manual, sources, screenshots and infographics.

The manual is designed as a continuous book, for shooters who are starting out and for expert readers alike. Its 204 subsections each develop one idea through pedagogical prose, a bespoke generative PNG infographic, dated sources, a practical case and a technical reading. Each chapter closes with a summary of what has been learnt, and the final closing section synthesises useful conclusions and future lines of validation.

**Try the application:** <a href="https://rcanalescoder.github.io/Plato/app.html" target="_blank" rel="noopener">open the simulator on GitHub Pages</a>. On GitHub, the direct link to the HTML files shows the code; GitHub Pages is the published URL that runs the application.

There is no `docs.html` or `manual.html` as a parallel source. The living documentation is consolidated in `en/index.html`; `app.html` links back to its sections.

![Main view of the simulator](docs/screenshots/vista-principal.png)

## Editorial Method of the Book

The unit of research is not the whole chapter, but each of the 204 subsections. The process applied to each unit requires:

1. Formulating the real question the reader must be able to resolve.
2. Researching sources appropriate to the subject: regulations, federations, technical documentation, manufacturers, scientific literature, clubs or the simulator's code.
3. Expressly separating verified facts, territorial or sporting variations, practical experience and simplifications of the model.
4. Explaining the concept first in accessible language, then opening a verifiable technical layer.
5. Developing a case, a shooting-ground situation or a concrete exercise.
6. Incorporating an exclusive generative PNG infographic, square and with a white background; no path or image is reused between sections.
7. Showing the sources and the review date next to the text they support.
8. Reviewing continuity, contradictions and links with the rest of the book.

The automatic validation checks that exactly 204 articles and 204 distinct PNGs exist, that each image is a square PNG of at least 1000 px, and that each section has substantial length, visible sources, a review date, specific alt text and its contractual image. The editorial review adds the human check of prose, pedagogical usefulness and scientific coherence.

## 1. Scope

The simulator represents a round of 25 clays across three modes:

- **Universal Trench**: five machines inside a trench. The orange marker clay is centred over machine 3 and indicates the clay's release point when the machine is set to zero degrees.
- **Olympic Trap**: fifteen machines grouped into five stations. In this mode the active marker clay moves in front of the shooter's station, and the other possible marker clays are shown in grey.
- **Robot**: a single oscillating/programmable machine. It includes ABT CPSA 2026 and Trap1 FITASC 2025 as separate regulated profiles, plus three popular non-regulation models. The shooter also rotates through the five stations.

The main viewpoint is the shooter's right eye, at a height of 1.70 m. The shotgun is not drawn as an external object; the user sees the red aiming point and, when there is rib gain, a translucent point that shows how the effective point of impact rises.

## 2. Controls

- **Call for the target**: requests a new clay.
- **Repeat target**: relaunches the same previous clay with the same machine, angle, height and distance. Useful for studying very lateral or fast clays.
- **Fire**: fires the current cartridge.
- **Reset**: restarts the round.
- **Station - / Station +**: changes the starting or current station.
- **Flat / High**: toggles between a rib with no gain and a raised rib.
- **Mouse**: the game's cursor is the red aiming point itself.
- **Right button**: calls for the target.
- **Left button**: fires the first and second shot.
- **Legend**: shows the scene's symbols and, on screens with enough room, a quick mouse guide: right to call for the target, left to fire and movement to aim.
- **Lead aid**: shows or hides the yellow point/area where it is best to hold the shot. When hidden, the physics and corrections keep being calculated.
- **Trajectory**: shows or hides the dashed orange line of the clay's flight.
- **Visual zoom**: brings the scene closer for small screens or users with poorer eyesight. The value `1.00x` keeps the regulation scale; higher values narrow the visual lens without changing distances or physics.
- **Release delay**: a brief time between calling for the target and the clay actually leaving the trap. The default is `0.03 s`, intended as a system/machine delay, not human reaction.
- **Pattern, shot 1 / Pattern, shot 2**: adjust the pattern spread of each shot, as an approximation of different chokes.
- **Pattern variance**: introduces irregularity between shots: gaps, small clusters and slight velocity differences between pellets.
- **Residual energy**: the simulator calculates velocity loss with distance and requires a minimum energy to break the clay. If a pellet makes contact but arrives weak, it is marked as `Weak hit`.
- **Analysis**: controls how long the trails and the clay's break or fall stay visible. The shot's correction is kept until the shooter changes station.
- **Robot force**: Robot mode only; simulates tightening or loosening the spring, altering initial velocity and range.
- **Robot height**: Robot mode only; adds or subtracts vertical tilt on the machine.
- **Robot spread**: Robot mode only; multiplies the lateral spread of the sequence.
- **Repeat target**: repeats the same clay from the same station, without adding a clay or advancing the rotation.
- **Quick help**: opens an explanation for beginners about modes, velocities, cartridges, spreads, trajectories and how to read the on-screen elements.
- **Generate notebook**: produces a printable landscape A4 PDF with the whole round of the active scheme and downloads it. See [2.1](#21-shot-point-notebook).

### 2.1. Shot Point Notebook

The **Generate notebook** button, at the bottom of the settings panel, compiles a PDF with the whole round: 25 sheets in Universal and in Robot, 15 in Olympic. Each sheet draws a clay's trajectory as seen from the shooter's eye, with five moments marked on it and, at each one, the lead you need to hold, expressed in centimetres, in clay widths and in degrees.

Four of those moments fall within the window where the clay is still on for a shot; the fifth is deliberately outside it, to show what falling behind costs. The document opens with a cover page that explains this and closes with the usage notice and the licence.

The notebook is generated with **whatever settings are in place at that moment**, which are printed in the header of each sheet, highlighting in colour those that are not the starting ones. A lead means nothing without the combination that produced it: with a different rib, a different cartridge or with wind, a new one needs to be generated.

Everything happens in the browser, with no server or dependencies. In `docs/cuadernos/` there are three notebooks already generated — one per mode, with the same settings so they are comparable — and a ZIP with all three.

The scene does not move as you aim. The ground, the trap, the marker clay and the markings stay fixed; what moves is the aiming point, just as in the shooter's perception when they keep their head aligned and move the shotgun.

If a clay leaves the useful shooting window, the attempt is closed as a miss, the lead aid disappears and the round moves on to the next station without waiting for the clay to fall outside the shooting ground.

The projection uses a base vertical field of view of 48°. This way the perceived size of the trap and the clay depends on the viewing angle, not on the monitor's exact aspect ratio; a wider screen shows more lateral field, but should not artificially push the scene further away. The visual zoom control multiplies the camera's focal length to improve legibility without touching the ground's real geometry.

## 3. Field Geometry

The system uses metres as its internal unit.

| Element | Implemented value | Reference used |
| --- | ---: | --- |
| Eye height | 1.70 m | Shooter model defined for the simulator |
| Station line to trap | 15 m | FITASC/ISSF rules |
| Visual depth of the trap | 1.45 m | Scene approximation |
| Universal station spacing | 2.50 m | Practical approximation for five stations |
| Olympic station spacing | 3.15 m | ISSF range 3.00-3.30 m |
| Universal machines | 5 | FITASC Universal Trench |
| Olympic machines | 15 | ISSF Trap |
| Visible release height | 0.16 m | Release mouth above the trap cover |
| Machine position under the trap | 0.50 m below the cover and 0.50 m back | FITASC Universal Trench 1.03 |

In Universal, the orange marker clay stays in front of the trap and over station 3's centre line. In Olympic, the active marker clay appears in front of the station being shot from; the other marker clays remain grey for reference.

## 4. Regulations Used

The implementation uses official rules and tables as a guide, but does not aim to replace a ground homologation.

- **FITASC Universal Trench**: five machines inside the trench, stations 15 m from the trap's front edge and a clay/marker clay over machine 3 to indicate release at 0°. The machines are modelled on aligned bases, 1.10 m apart, with the pivot roughly 0.50 m below the trap roof and 0.50 m back from the front edge.
- **Universal schemes**: ten schemes are modelled (`fu1` to `fu10`) with lateral angles from -45° to +45°, heights from 1.5 to 3.5 m and distances from 60 to 75 m.
- **ISSF Olympic Trap**: fifteen machines grouped into five groups of three; the ten tables (`issf1` to `issf10`) from the ISSF 2026 second print are transcribed, and a target distance of 76 ±1 m is used.
- **Robot / ABT / Trap1**: `ABT CPSA 2026` uses 70 ±1 m, a ±30° sector and a height of 1.5-3.5 m at 10 m. `Trap1 FITASC 2025` uses 50 ±2 m, a recommended ±22° sector and a height of 1.7-2.7 m in the modelled installation. The circular-fairground, extreme-popular and pseudo-random presets are labelled `Non-regulated model`.
- **Clay**: it is represented as a solid orange disc with a stepped shape, approximating the real clay of 110 mm diameter and 25-26 mm height described in ISSF technical rules.

Sources consulted:

- [FITASC, International Rules Universal Trench 2025](https://api.fitasc.com/media/2025-rglt-fu-eng-6825cd1e3ae7b895386562.pdf)
- [ISSF Rule Book 2026, second print](https://backoffice.issf-sports.org/getfile.aspx?file=ISSF-Rule-Book-2026-Edition-2025-Second-Print-07-2026-Effective-1-July-2026.pdf&inst=455&mod=docf&pane=1)
- [ISSF technical target dimensions, federation PDF](https://www.asia-shooting.org/wp-content/uploads/2023/01/ISSF_Technical_Rules_Draft_01.01.2023-6.pdf)
- [USA Shooting / ISSF General Technical Rules, station and trap reference](https://usashooting.org/app/uploads/2022/04/2013_USAS_GTR.pdf)
- [RIO Star Team EVO Training, product sheet](https://centerfiresystems.com/collections/ammunition-shotshells/products/rio-ammunition-star-team-evo-training-12-gauge-2-75-1-1-8-oz-7-5-shot-box-or-case)
- [Beretta, DT11 International Trap](https://www.beretta.com/en-us/product/dt11-international-trap-FA0095)
- [Beretta, OptimaChoke HP choke guide](https://estore.beretta.com/en-hu/utility/choke-tubes-guide)
- [Beretta, choke selection guide](https://www.beretta.com/en-us/blog/how-to-choose-the-right-shotgun-choke-tube)
- [Hunter-ed, Shotgun Choke and Shot String](https://www.hunter-ed.com/national/studyGuide/Shotgun-Choke-and-Shot-String/201099_92847/)
- [NRA, Shotshell Ballistics, PDF](https://rangeservices.nra.org/media/4074/shotshell-ballistics.pdf)
- [CPSA Booklet 1, Rules 2026, Automatic Ball Trap](https://www.cpsa.co.uk/files/download/2644/CPSA-Booklet-1---Rules-26.pdf)
- [FITASC, Trap1 2025](https://api.fitasc.com/media/2025-rglt-trap1-eng-6825cd64b76c7218197857.pdf)
- [White Flyer, Shotgun Disciplines](https://whiteflyer.com/resources/shotgun-disciplines/)
- [Promatic Super Sporter 8 Wobble](https://www.promaticus.com/product-page/super-sporter-8-wobble)
- [Laporte American Trap](https://www.laporte.biz/en/our-traps/american-trap/)
- [Atlas Tri-Axis Wobble AT-250](https://www.atlastraps.com/Tri-axes-wobble-trap--AT250_p_204.html)
- [Bowman ABT Base](https://bowmantraps.co.uk/product/abt-base/)

## 5. Clay Release

When the target is called, the application:

1. Keeps the red point at the initial hold.
2. Selects a machine from the active scheme.
3. Waits for the configured **Release delay**, low by default so the release feels immediate.
4. Calculates the release vector from the horizontal angle, the height required at 10 m and the regulation distance.
5. Launches the clay from the trap's mouth/slit at the active marker clay's footprint, with the machine physically set back and below.
6. Simulates the flight with reduced gravity and optional crosswind.

The old concept of shooter "reaction" was replaced by this release delay, because the simulator no longer automatically moves the shotgun chasing the clay. The real reaction is left in the user's hands: when they spot the clay, move the red point and fire. The control only represents the small interval between the order to call the target and the physical appearance of the target.

In FITASC Universal Trench, release is defined as immediate after the call, only accounting for reaction time to the sound, given as roughly a tenth of a second. That is why the simulator's initial value is `0.03 s`: it leaves a minimal technical latency without turning it into an artificial wait.

The active machine, visible under the translucent ground, is placed along the reverse extension of the launch vector. So the solid machine-to-mouth segment and the clay's initial trajectory are collinear; if the trajectory curves afterwards, it is due to the integration of gravity/wind, not an artificial kink as it leaves the trap.

The initial velocity is not chosen at random. For each row of a regulated scheme, a parabola is solved that simultaneously satisfies:

- the height required at 10 m;
- the scheme's fall distance: 60-75 m in Universal and 76 m in Olympic.

In **Robot** mode, ABT and Trap1 generate continuous positions within their limits; the three popular models cycle through or draw rows at random. Their controls modify the base configuration:

- `Robot force`: multiplies the range, like tightening or loosening the spring.
- `Robot height`: modifies the height at 10 m, like changing the trap's tilt.
- `Robot spread`: multiplies the horizontal angle, like opening or closing the sweep.

The top bar shows `Within limits`, `Outside limits` or `Non-regulated model`. Universal and Olympic use `Matches official table` when the launch reproduces the corresponding row.

At the top of the scene a verification bar appears with initial velocity, angle, actual height at 10 m, calculated range and a compliance check. If wind is switched on, the bar indicates that the validation corresponds to the machine's base setting without wind.

The clay's position over time is calculated as:

```text
x(t) = x0 + vx*t + 0.5*wind*0.28*t^2
y(t) = y0 + vy*t - 0.5*g*0.42*t^2
z(t) = z0 + vz*t
```

The reduced gravity factor does not claim that the clay ignores gravity; it practically compensates for the real clay's aerodynamic lift, to produce a visual, trainable trajectory.

## 5.1. Automatic Scheme Verification

The repository includes a dependency-free test to audit all the schemes defined in `app.html`:

```bash
node scripts/verify-schemes.js
```

The test first compares the tables extracted from `app.html` against independent regulatory fixtures, and then runs through 200 launches: 50 Universal and 150 Olympic. It fails if a row differs from its source, or if the physics does not reproduce the height and range. It also checks the metadata and limits of ABT CPSA and Trap1 FITASC.

This test stops an edit from breaking the tables or their geometry unnoticed. The application shows the same concepts at the top that the test audits: model velocity, machine, angle, height at 10 m, range and flight time. `Matches official table` is a software check, not a ground homologation.

The schemes are defined as data inside `app.html` itself. To add or review a table, the correct workflow is:

1. modify the rows of machines, angles, heights and distances;
2. run `node scripts/verify-schemes.js`;
3. check that the application's top bar reflects the same values;
4. only afterwards adjust the visual representation if needed.

## 6. Lead

The yellow/translucent area represents the zone it is best to aim at, so the pellet cloud intercepts the clay. It is not a magic point: it is a physical estimate recalculated every frame.

![Lead cloud over the clay](docs/screenshots/nube-adelanto.png)

The visual lead aids are clipped to the ground: if the recommended point or the future trajectory would fall below the terrain, they stop being drawn, so as not to suggest an impossible shot.

The calculation starts from two ideas:

- The clay keeps moving while the pellets travel.
- The further away the clay is, the longer the pellets take, and the more lead is usually needed.

The application first calculates an approximate intersection between the clay and the centre of the shot. It then refines the angle with a local search that minimises the distance between the centre of the pellet cloud and the clay, using the same physics integrator used to validate impact.

## 7. Cartridge and Pellets

The reference cartridge is the RIO Star Team EVO Training. In the current version it is modelled as:

- Configurable cartridge velocity.
- Initial effective pellet velocity: `velocidad_cartucho * 0.78`.
- Velocity loss with distance via a simplified exponential curve.
- Individual residual energy per pellet.
- Minimum breaking threshold: if a pellet makes contact but arrives below the threshold, it does not break the clay.
- 306 pellets, an approximation compatible with a 1 1/8 oz load of #7.5 lead shot.
- Spread configurable separately for shot 1 and shot 2.
- Non-Gaussian cloud pattern, with variation per shot, to approximate a pellet flow with rings, gaps and internal clusters.
- A central pellet representing the core of the pattern, plus a cloud distributed around it.
- Slight differences in velocity and release between pellets, to represent a simplified shot string: the cloud does not arrive as a perfect flat disc, but as a short moving volume.

The reference shotgun is a trap Beretta DT11. Beretta documents the DT11 within the OptimaChoke HP barrel/choke family, and trap setups usually work with tighter chokes. The simulator uses conservative initial values:

| Shot | Practical reference | Initial control |
| --- | --- | ---: |
| Shot 1 | 3/4 / Improved Modified, somewhat more open for a nearby clay | 30 |
| Shot 2 | Full, tighter for a clay further away | 20 |

These controls do not change the number of pellets; they narrow or widen the radius of the pattern cone. The current formula is:

```text
radio_patron = 0.22 + apertura*0.0045 + distancia*(0.0035 + apertura*0.00003)
distancia_perdigon(t) = ln(1 + k*v0*t) / k
velocidad_residual(d) = v0 * e^(-k*d)
energia = 0.5 * masa_perdigon * velocidad_residual^2
```

Where `apertura` is the value of the control for the current shot. Low values represent tighter chokes. The constant `k` is a practical drag approximation, calibrated to show that energy falls off with distance, without claiming an exact curve for every cartridge.

### 7.1. Realistic Pattern Variation

The **Pattern variance** control adds realism to the pattern without turning it into a lottery. With low values the pattern looks more like a repeatable target; with high values, micro-gaps, small clusters, a more irregular periphery and slight velocity differences between pellets appear.

This approximates the real behaviour of a shotgun load: as the pellets leave the cartridge, they do not form a perfect mathematical circle, but a three-dimensional cloud, or *shot string*. Hunter-ed describes the *shot string* as the three-dimensional spread of pellets after leaving the barrel. In the simulator it is modelled in a contained way, because at clay-target distances the dominant effect is still the lead, the choke's spread and the position of the pattern's centre.

The implementation uses a different seed per shot. That seed alters:

- the angular position of each pellet within the cone;
- the relative radius of each ring of the pattern;
- small clusters and gaps;
- a slightly lower velocity in some of the peripheral pellets;
- a very small delay for some pellets, so the cloud has depth.

The aim is not to represent a full CFD simulation of the wad, the friction between pellets and the deformation of the lead shot. It is a practical approximation: it keeps a trainable, physically explainable pattern, while stopping the pattern panel from looking like a perfect synthetic template.

### 7.2. Physical Impact

Each shot generates individual directions for every pellet. For each one, trajectory, velocity loss and energy relative to the clay are simulated. The geometric check uses a radius of 5.5 cm, matching the 110 mm clay:

```text
px(t) = ojo.x + dir.x * distancia_perdigon(t)
py(t) = ojo.y + dir.y * distancia_perdigon(t) - 0.5*g*t_local^2
pz(t) = ojo.z + dir.z * distancia_perdigon(t)
```

The clay only breaks if some pellet physically intersects its simplified volume and arrives with enough energy. That is why you can aim near the ideal area and still miss: the cloud has spread, the clay is moving, the user can be slightly behind/ahead/high/low, and on top of that a pellet can arrive without enough force to break it. When the simulator shows `Broken edge`, it means the centre of the pattern was not perfectly centred, but a peripheral pellet reached the clay with enough energy. When it shows `Weak hit`, there was geometric contact below the breaking threshold.

The integration advances in `0.0007 s` steps, but it does not just compare their endpoints: it calculates the closest approach of the relative motion within each segment. This way a fast pellet cannot skip over the clay between samples. The volume is simplified as a sphere, and the `0.55 J` threshold is not calibrated against a real batch.

The deterministic audit is run with:

```bash
node scripts/verify-ballistics.js
node scripts/verify-manual.js
```

It checks centre, edge at 55 mm, outside at 56 mm, insufficient energy, effective range, difference between chokes, seeded variation, equivalence between slow motion and real time, rib gain, yellow guide and separation between shot 1 and shot 2.

## 8. Correction After the Shot

The bottom-left correction panel helps you understand why the clay was broken or missed. It is divided into **shot 1** and **shot 2**. Each sub-panel appears only once that shot exists, so as not to distract beforehand.

Each sub-panel represents a plane perpendicular to the pellets' trajectory in the clay's area. This view is more useful than a simple top/side projection, because it shows the shot's real pattern as if a target had been placed at the point where the clay was:

- The clay is drawn in orange at the centre of the reference plane.
- The light-blue dots are individual pellets projected onto that plane.
- The green dots are pellets that broke the clay.
- The red point marks the physical centre of the shot.
- The colour indications explain whether the shot ended up high, low, ahead or behind relative to the clay.

The lead axis is calculated following the clay's real flight direction. That is why it changes visually when the clay is heading right or left: "ahead" always means ahead along the target's trajectory, not simply to the right or left of the screen.

The yellow reference is the recommended physical point; the red point represents the shooter's aim; the light blue represents the physical centre of the current shot's pattern. The yellow ring and the blue ring each scale separately with their own 3D distance to the shooter's eye, because they can be at different depths.

The **Analysis** control sets how many seconds the fragments and trails stay visible after the shot. The frozen correction remains until the shooter's station change is applied, because it belongs to the station it was fired from. It is a visual aid: it does not alter the physics or count clays. Slow motion is also visual; to try a round in real time you need to raise **Slow motion** to `1.00x`.

![Correction windows for the first and second shot](docs/screenshots/correcciones-doble-tiro.png)

## 9. Hold and Rib

The application distinguishes two concepts:

- **Neutral hold**: the red point starts pointing at the marker clay.
- **High hold**: the initial starting point is placed somewhat above and towards the station's natural side, to help avoid blocking the view of the clay at the start.

**Rib gain** modifies the effective point of impact. Visually:

- The red point is where the shooter is aiming.
- The translucent point shows where the centre of the shot would land, due to the rib's elevation.

This lets you represent the difference between a flat-shooting gun, which forces you to cover the clay more, and a setup with gain, where you can aim somewhat below because the shot leaves higher than the aiming point. The current range goes up to `0.96°` of ballistic elevation, so the effect is clearly visible during training.

The graphical representation of the rib is disabled for now, so as not to confuse the visual training. The gain remains active as a ballistic calculation: it does not draw the shotgun, it only shifts the physical point of impact upwards.

## 10. Round of 25 Clays

The round is modelled as a series of 25 clays:

- The counter shows clays shot at and broken.
- The shooter rotates through stations 1, 2, 3, 4 and 5.
- The station does not advance until the break effect or the visual analysis of the miss finishes.
- The starting point can be changed manually to begin from a different station.

![Full view with controls and panels](docs/screenshots/vista-completa.png)

## 11. Limitations

The simulator is a visual training and experimentation tool. Physical quantities are expressed in metres, seconds and degrees, but some constants are approximations calibrated for an experience that is easy to follow on screen:

- The clay's aerodynamics are simplified with an effective gravity.
- The pellets' velocity loss is modelled with a pedagogical exponential curve, not with an exact table by shot size, temperature, wad and barrel.
- The breaking-energy threshold is a trainable approximation; it should be calibrated with real data if homologation is sought.
- The pattern includes variation per shot, but does not model the full individual deformation of the lead shot, internal wad friction or real turbulence.
- The real probability of breaking a clay depends on the cartridge, choke, barrel, wind, clay quality and effective distance.

## 12. Running Locally

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## 13. Structure

```text
.
├── index.html
├── app.html
├── README.md
├── docs/
│   ├── assets/       # generative PNG infographics
│   ├── cuadernos/    # already generated shot point notebooks, and their ZIP
│   ├── manual-libro/ # assets imported from the single manual
│   └── screenshots/
├── scripts/
│   ├── verify-schemes.js
│   ├── verify-ballistics.js
│   └── verify-manual.js
└── auxiliares/        # local temporary scripts, excluded from git
```

## 14. Licence

This project is published under the MIT licence. The canonical text is in [`LICENSE`](LICENSE) and its informative Spanish translation in [`LICENCIA_ES.md`](LICENCIA_ES.md).

Unless a file expressly states a different origin or licence, this scope covers the source code, the original documentation, the simulator's screenshots and the PNG infographics created for Plato. Linked external sources are cited as bibliography and retain their own rights; they are not redistributed as if they were the project's work.

Copyright (c) 2026 Roberto Canales Mora

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

When using, copying, modifying, distributing or publishing derivative versions of this project, the reference to the original author, **Roberto Canales Mora**, must always be kept, together with the link to [www.robertocanales.com](https://robertocanales.com/proyectos#plato). This attribution is part of the copyright and permission notice that must accompany all copies or substantial portions of the software.

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
