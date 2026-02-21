# History

Decision log and completed work, in reverse chronological order.

## 2026-02-20 — Documentation Review & Clarification

**Branch:** byamron/doc-review
**Summary:** Deep review of all Framer reference components and documentation. Clarified component relationships, identified gaps, and updated CLAUDE.md and PLAN.md with findings.

**Key decisions:**
- **SectionHighlight is dropped.** GlassHighlight.tsx is the only glass pill component needed — SectionHighlight was an earlier iteration.
- **Theme_Image uses 4 variants**, not 5. The 5th variant slot in the original is vestigial.
- **Typography baseline**: Manrope, 18px body / 36px headings, regular weight, 120% line height. Nuances to be refined later.
- **Glass pill defaults**: Use the values from GlassHighlightControls.tsx as the starting spec. Will be refined through testing.
- **CSS theme token values**: To be provided by Ben (extracted from the live Framer site). Framer-generated token IDs will be replaced with semantic variable names.
- **Project content data**: To be provided by Ben.

**Technical details:**
- Documented full data flow for theme changes, appearance mode changes, hover previews, and glass highlight interactions
- Identified that Framer timing hacks (50-100ms setTimeout delays) are unnecessary in React since we control our own CSS
- Noted that GlassHighlight uses raw DOM manipulation (createElement, Web Animations API, rAF lerp loop) — needs useEffect-based integration or vanilla JS wrapper
- Updated reference file mapping table with migration status for each file
