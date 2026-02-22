# Feedback Log

Record negative feedback and lessons learned here. Review this file before starting new work.

## 2026-02-21 — CSS transitions + RAF loop conflict for glass pill

**What was attempted:** Used CSS transitions (`transform`, `width`, `height`) for card-to-card pill slides, with a separate `requestAnimationFrame` loop for gravitational pull physics. Added an `isSliding` flag and `setTimeout` to defer RAF writes during the CSS transition.

**What went wrong:** The two animation systems fought each other. The RAF loop's first action in `startPullLoop()` was stripping the `transition` property to `opacity only` — killing the transform/width/height transitions before they could animate. Even with the `isSliding` workaround, the handoff between CSS and RAF was unreliable. The pill jumped or stuttered instead of gliding.

**Lesson learned:** Never mix CSS transitions and RAF loops on the same properties. If you need physics-based motion (lerp, spring, gravitational pull), use RAF for ALL movement — including what initially seems like a simple A-to-B slide. The lerp naturally produces smooth deceleration that feels physical. CSS transitions are for simple state changes (opacity, color); RAF is for continuous/interactive motion. One system, no handoffs, no conflicts.

## 2026-02-21 — Glass pill sizing: cards must hug text

**What was attempted:** ProjectLink used `display: flex` without width constraints, filling the parent flex column's full width. The glass pill (which sizes to `getBoundingClientRect()` of the hovered card) stretched across the entire column.

**What went wrong:** The pill looked like a full-width bar highlight, not a compact glass surface hugging the link text. Didn't match the Framer original.

**Lesson learned:** Cards need `width: fit-content` so they shrink to their text content. Use `padding: 24px 16px` with `margin: 0 -16px` to keep text aligned with surrounding paragraphs while giving the hover area generous padding. Always check the reference branch (`davis` worktree / `byamron/react-portfolio-build`) for correct styling values.
