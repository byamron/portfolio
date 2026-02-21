# History

Decision log and completed work, in reverse chronological order.

<!-- Format:
## YYYY-MM-DD — [Brief Title]
**Branch:** ...
**Summary:** ...
**Key decisions:** ...
**Technical details:** ...
-->

## 2026-02-20 — Created design-language.md

**Branch:** `byamron/design-language-doc`

**Summary:** Created `core-docs/design-language.md` — a comprehensive design language specification that codifies the visual and interaction rules governing the site. Derived from analysis of all 8 screenshots across themes, all 10 original Framer components, and the existing CLAUDE.md and plan.md documentation.

**Key decisions:**
- Structured the doc around principles and rules rather than just values — it explains the _why_ behind every choice, not just the _what_
- Included an explicit anti-patterns section to prevent common deviations (second typeface, drop shadows, scroll animations, etc.)
- Added a coherence checklist for verifying implementation consistency
- Positioned design-language.md as the first file to read before any design/implementation work, referenced in both CLAUDE.md and plan.md

**Technical details:**
- Updated CLAUDE.md core docs table to include design-language.md with its purpose and update trigger
- Added a new rule in CLAUDE.md requiring design-language.md review before any design/implementation work
- Added a cross-reference callout at the top of plan.md linking to design-language.md as the source of truth for visual decisions
