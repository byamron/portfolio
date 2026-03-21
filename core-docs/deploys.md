# Deploy Tracker

Netlify auto-deploys when `main` is updated. Monthly limit: **20 deploys**. Billing cycle resets on the **14th of each month**.

## Current Cycle: March 14 – April 13, 2026

| # | Date | PR / Commit | Description |
|---|------|-------------|-------------|
| 1 | 2026-03-14 | PR #53 | Netlify deploy setup |
| 2 | 2026-03-15 | PR #54 | Cursor fixes |
| 3 | 2026-03-15 | PR #55 | Performance audit optimizations |
| 4 | 2026-03-15 | PR #56 | Fix preview image overlap |
| 5 | 2026-03-15 | `9f7b4a6` | Update contribution data (automated) |
| 6 | 2026-03-15 | PR #57 | Deploy tracking and next-update branching strategy |
| 7 | 2026-03-19 | PR #59 | Batch deploy: glass pill fix, double cursor fix, sidebar backdrop, glass wiggle, responsive two-column |
| 8 | 2026-03-21 | PR #80 | Batch deploy: resume update, portrait fix, case study polish, section reorder, figpal fix, Duo preview, favicon/meta, signature, contribution grid, coming soon labels, video previews, title sync |

**Deploys used: 8 / 20** — 12 remaining

---

## Branching Strategy

- **Feature branches** → PR into `next-update` (no deploy, no cost)
- **`next-update`** → PR into `main` only when ready to deploy (costs 1 deploy)
- Batch multiple features into a single `next-update → main` merge to conserve deploys

## Previous Cycles

_(Move current cycle table here when a new cycle starts on the 14th)_
