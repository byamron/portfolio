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

**Deploys used: 6 / 20** — 14 remaining

---

## Branching Strategy

- **Feature branches** → PR into `next-update` (no deploy, no cost)
- **`next-update`** → PR into `main` only when ready to deploy (costs 1 deploy)
- Batch multiple features into a single `next-update → main` merge to conserve deploys

## Previous Cycles

_(Move current cycle table here when a new cycle starts on the 14th)_
