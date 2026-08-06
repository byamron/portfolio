# Consensus prototype

Lightweight, mock-data-only code prototype of the Context-Aware Collections concept — see
`../problem-definition/ai-first/05-design-conventions.md` for the design rationale and token source
(the Paper.design capture in §6).

No backend, no real search/AI, no persistence across reloads. Dark theme only.

## Run

```
npm install
npm run dev
```

## What's here

- **Home** — search input creates a new mock thread (canned response after a short delay).
- **Thread** — follow-up chat (mock replies), inline citation chips, References drawer, "open a source"
  (citation chip or reference card → paper detail panel), and saving a reference to a collection from the
  thread (bookmark icon on a reference card).
- **My Library** — nav rail swaps to the reduced Library shell; select a collection to see its Items/
  Threads tabs. Anything saved from a thread shows up here.
