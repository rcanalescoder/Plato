# Plato editorial contract

These instructions apply to the whole repository and must be followed in every Codex session.

## Bilingual book

- Treat `index.html` and `en/index.html` as one bilingual publication. Any editorial change to one book must be made with the same meaning, pedagogical depth, structure, safety qualifications and references in the other.
- Do not deliver a book change while section numbers, navigation, conclusions, references or image pairs differ unintentionally between languages.
- Spanish and English are separate editorial versions, not machine-translated fragments. Localise headings, prose, alternative text, captions and all text inside images.

## Infographics

- Every new or substantially rewritten subsection needs one unique infographic in each language, at a density and visual quality comparable with the surrounding chapters.
- Generate original raster images, normally square PNG files of at least 1254 × 1254 px. Never use SVG for book infographics and never leave title cards, “coming soon” notices or other placeholders.
- Use a clean white outer background. Match the established Plato visual language: dense editorial composition, dark navy technical drawing, orange clays and accents, restrained green success cues, clear hierarchy and generous margins.
- The English image must be a fully localised counterpart of the Spanish image. It may share composition but must be generated or edited as its own raster asset; all visible language must be English.
- Store Spanish subsection images under `docs/manual-libro/assets/images/infografias/subapartados/` and English counterparts under `docs/manual-libro/assets/images/infografias/en/subapartados/`. Use the same filename for a pair.
- In generic clay-shooting scenes, depict a modern, full-length over-under shotgun. From the shooter's eye, show one upper barrel or rib; in side or open-action views, keep the two barrels and chambers vertically stacked. Never make the gun resemble a sawn-off shotgun. Show a side-by-side only when the subsection explicitly explains or compares that shotgun type.
- Inspect the final pixels at full size. Check spelling, white background, firearm handling, muzzle direction, open-gun states where appropriate, legibility and conceptual accuracy before integration.

## Research, copyright and evidence

- Use third-party books, pages and supplied analyses to discover gaps and locate evidence, never as prose to imitate. Write an original synthesis; do not closely paraphrase, reproduce diagrams or copy a source's structure.
- Quote only when essential, keep quotations brief and attribute them. Cite every source that materially supports a factual, historical, regulatory or scientific claim in the final bibliography of both languages.
- Prefer official regulations and primary or peer-reviewed research. Keep reviewed research, official rules, coaching experience, personal experience and commercial claims visibly separate.
- State sample size, discipline and transfer limits when evidence from rifle, pistol or another sport is applied to clay shooting. Avoid universal recipes and causal claims that the evidence does not justify.
- Named coaching or commercial systems may be described as such, but must not be presented as scientific proof. Flag weak, preliminary or mixed evidence explicitly.

## Pedagogy and safety

- Preserve the book's beginner-first tone: plain language, one practical idea at a time, links to earlier chapters, concrete exercises and separate field or technical notes when useful.
- Connect new material to concepts already taught rather than repeating them. Maintain the one-variable learning method used throughout the book.
- Preserve the book's sport-first progression: foundations, access, safety, ground, equipment, errors, learning, geometry, mind, body and competition day, disciplines, costs, physical model, limitations, simulator, simulator training, installation, sources and conclusions. Human preparation, sporting context, economic expectations, theory and model limits must be established before the simulator.
- Keep the simulator chapter limited to the reviewed interface and its operation. Put physical, ballistic, regulatory, perceptual and economic explanations in the earlier chapter where each belongs, then link back instead of teaching them again. Put structured exercises and training plans in the following training chapter.
- Treat adjustable equipment as a measured fitting process: record a recoverable baseline, change one variable and verify it across comparable tests. Never teach readers to chase an isolated miss by repeatedly changing the stock, rib or other hardware.
- Firearm safety, ground rules, qualified in-person coaching and professional health support take precedence over performance advice. A simulator, book or mental exercise never replaces them.

## Workflow and verification

- Inspect `git status` and the relevant diff before editing. Preserve unrelated and pre-existing user changes.
- After bilingual book work, run at least:
  - `node scripts/verify-manual.js`
  - `node scripts/verify-books-parity.js`
  - `node scripts/verify-schemes.js`
  - `node scripts/verify-ballistics.js`
- Run any more specialised image or language audits present in `scripts/` when relevant. Visually inspect all new images even when structural tests pass.
- Do not describe a working tree as published or assign it a release number. Record a commit only after that commit actually contains the delivered HTML, references, scripts and raster assets.
