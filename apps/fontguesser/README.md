# Font Guesser

A daily game for naming typefaces. A specimen sheet renders in a mystery Google
Font; you name it; the reveal hands back the designer, the provenance, the usage
figures and Google's own notes on the design.

Built for designers and type people — the reveal is the point as much as the
guess, and doubles as a way to find faces worth using.

## How it works

- **Daily** — one puzzle, shared by everyone, seeded from the date. Two or three
  guesses depending on mode, then it's done until midnight.
- **Endless** — unlimited practice. The pool is yours to set: top 100, top 500,
  or all 1,225.
- **Multiple choice** (two guesses, four confusable options drawn from the same
  category and popularity band) or **Type it** (three guesses against the whole
  library, with search).

The specimen is a working type tester. Display line, subhead and paragraph are
each independently editable, with size, weight, tracking and leading on a rail
that retargets to whichever block has focus — because typing "Handgloves" and
pushing the size around is how anyone actually identifies a face.

## Data

`npm run fonts` vendors the library into `src/data/` at build time from three
keyless sources: the Google Fonts metadata endpoint, the `google/fonts` repo
descriptions, and the usage-stats endpoint. The game itself makes no runtime
calls to Google beyond loading the faces.

The pool is filtered to Latin-primary, non-Noto families — a Korean or
Devanagari face ships Latin glyphs as an afterthought, and naming one from a
paragraph of English is not a fair question.

## Development

```
npm install
npm run fonts    # rebuild the font manifest (~2 min)
npm run dev
npm run build
```
