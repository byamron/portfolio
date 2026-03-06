# Feedback Log

Record negative feedback and lessons learned here. Review this file before starting new work.

## 2026-03-05 — localStorage values must be validated against known sets

**What was attempted:** `ThemeContext` initialized `accentColor` from localStorage with `(stored as AccentColor) || 'table'`. `SidebarThemeControls` then did `accents.find(a => a.color === accentColor)!` to look up the active swatch.

**What went wrong:** The `|| 'table'` fallback only catches falsy values (null, empty string). If localStorage contains a truthy but invalid string (e.g. a stale value from a previous branch, a renamed accent, or any non-empty garbage), it passes through the `||` guard and gets used as-is. `accents.find()` returns `undefined`, and `activeSwatch.swatch` crashes the entire app — blank page, no error boundary, no recovery. This is especially common with worktree builds where different branches may write different localStorage values to the same origin.

**Lesson learned:** Never trust localStorage values with a simple `||` fallback. Always validate against the actual set of valid values using `.includes()` or a `Set.has()` check. The pattern is:
```ts
// BAD — only catches null/empty, not invalid values
const stored = localStorage.getItem(KEY)
return (stored as MyType) || defaultValue

// GOOD — validates against known values
const stored = localStorage.getItem(KEY)
return VALID_VALUES.includes(stored as MyType) ? (stored as MyType) : defaultValue
```
Additionally, any code that looks up a value from an array using `.find()` should use `?? fallback` instead of `!` (non-null assertion). The `!` operator silences TypeScript but doesn't prevent runtime crashes. Prefer defensive fallbacks (`?? accents[0]`) that keep the app running even with unexpected state.

**Scope:** This applies to ALL localStorage reads in the codebase — accent color, appearance mode, cursor mode, bg intensity, and any future persisted state. When adding new persisted values, always define a `VALID_*` array and validate on read.

## 2026-02-21 — backdrop-filter requires correct z-index stacking

**What was attempted:** Glass pill for sidebar controls was placed at z-index 0 (behind the controls) with backdrop-filter: blur(1px). Expected the blur to be visible through the transparent mode buttons above.

**What went wrong:** The pill was blurring the uniform dark page background behind it — blurring a solid color looks identical to no blur. Tried removing `willChange`, moving the pill to a parent container, adding z-index to sibling elements — all failed or made things worse.

**Lesson learned:** backdrop-filter blurs what's behind the element in the stacking order. For frosted glass to be visible, the pill must sit ON TOP of the content it should blur (z-index 10, matching useGlassHighlight). `pointerEvents: 'none'` ensures clicks pass through. Also needs `contain: layout style` and `willChange: transform, opacity` for proper compositing. Don't fight the stacking model — match the pattern that already works.

## 2026-02-21 — CSS transitions + RAF loop conflict for glass pill

**What was attempted:** Used CSS transitions (`transform`, `width`, `height`) for card-to-card pill slides, with a separate `requestAnimationFrame` loop for gravitational pull physics. Added an `isSliding` flag and `setTimeout` to defer RAF writes during the CSS transition.

**What went wrong:** The two animation systems fought each other. The RAF loop's first action in `startPullLoop()` was stripping the `transition` property to `opacity only` — killing the transform/width/height transitions before they could animate. Even with the `isSliding` workaround, the handoff between CSS and RAF was unreliable. The pill jumped or stuttered instead of gliding.

**Lesson learned:** Never mix CSS transitions and RAF loops on the same properties. If you need physics-based motion (lerp, spring, gravitational pull), use RAF for ALL movement — including what initially seems like a simple A-to-B slide. The lerp naturally produces smooth deceleration that feels physical. CSS transitions are for simple state changes (opacity, color); RAF is for continuous/interactive motion. One system, no handoffs, no conflicts.

## 2026-02-21 — Glass pill sizing: cards must hug text

**What was attempted:** ProjectLink used `display: flex` without width constraints, filling the parent flex column's full width. The glass pill (which sizes to `getBoundingClientRect()` of the hovered card) stretched across the entire column.

**What went wrong:** The pill looked like a full-width bar highlight, not a compact glass surface hugging the link text. Didn't match the Framer original.

**Lesson learned:** Cards need `width: fit-content` so they shrink to their text content. Use `padding: 24px 16px` with `margin: 0 -16px` to keep text aligned with surrounding paragraphs while giving the hover area generous padding. Always check the reference branch (`davis` worktree / `byamron/react-portfolio-build`) for correct styling values.

## 2026-02-22 — Trigger indicator must stay atmospheric, not structural

**What was attempted:** Prototyped 5 ways for the sidebar trigger dot (16×16, r=5) to reflect bg intensity level: glow, color (desaturation), ring (concentric outline), size (growth), fill (opacity).

**What went wrong:** Three variants broke design-language coherence:

- **Color (desaturation):** The trigger's primary job is to indicate the active accent. Desaturating it at low intensity made it unclear which swatch it represents. Swatch colors are defined as "constant across modes... a fixed reference point" (design-language.md § Color). Modifying the swatch color to encode a second variable undermines the trigger's identity role.
- **Ring (concentric outline):** The outline ring is already an established signifier for "this swatch is selected" (`1.5px solid color-mix(in srgb, <swatch-color> 50%, transparent), outlineOffset: 3px`). Reusing the same visual pattern on the trigger for a different purpose (intensity) creates competing semiotics — same shape language, different meaning. Users can't distinguish "selected" from "intense" at a glance.
- **Size (growth):** The trigger is 16×16 specifically to distinguish it from swatches (24×24). Growing to 22px collapses that distinction — at full intensity, the trigger could be mistaken for a swatch. Additionally, size change shifts the entire expandable toolbar below, creating layout instability in a control surface that should feel anchored.

**Lesson learned:** The trigger is a structural element — its size, shape, and color identity must remain fixed. Intensity indication must use *atmospheric* properties (luminance, opacity, glow) that layer on top of the trigger's identity without altering it. This follows the design-language principle that "the skeleton is permanent; the skin is variable." Structural properties (shape, size, selection indicators) encode identity and state; atmospheric properties (glow, opacity) encode environmental qualities like intensity.
