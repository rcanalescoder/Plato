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
