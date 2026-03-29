# Feedback Log

Record negative feedback and lessons learned here. Review this file before starting new work.

## 2026-03-28 — Hot-reloaded files cause blank pages; always verify with a hard reload

**What was attempted:** Edited component files (CaseStudyTypographyPanel, CaseStudyLayoutA) while the Vite dev server was running. The page went blank.

**What went wrong:** Vite's HMR (hot module replacement) can fail silently when edits change a component's exports, add new imports, or restructure JSX in ways the HMR boundary can't reconcile. The page goes blank with no visible error — it looks like a code bug but the production build (`vite build`, `tsc --noEmit`) passes clean. The blank page persists until the browser cache is cleared or a hard reload is performed.

**Lesson learned:** After any file edit that changes component structure (new imports, restructured JSX, new exports), **always hard-reload the browser** (Cmd+Shift+R) before investigating code. If the page is blank but build/typecheck passes, it's almost certainly a stale HMR state — not a code error. Don't waste time debugging phantom issues.

**How to apply:** When the user reports a blank page after edits: (1) ask them to hard-reload first, (2) only investigate code if the blank persists after hard reload, (3) mention this explicitly when delivering changes that touch component structure.

---

## 2026-03-25 — Check Google Fonts URL before using a font weight

**What was attempted:** Set inline project links to `fontWeight: 500` for contrast against surrounding 300-weight text.

**What went wrong:** Literata weight 500 wasn't loaded in the Google Fonts URL — only 300 was. The browser faked bold, producing no visible difference. Had to add weight 400 to the URL and use that instead.

**Lesson learned:** Before using a new font weight, verify it's included in the Google Fonts `<link>` in `index.html`. If the weight isn't loaded, the browser synthesizes it and it looks identical to the nearest loaded weight.

---

## 2026-03-25 — --text-light-grey has poor contrast in both modes

**What was attempted:** Used `--text-light-grey` for section labels and card subtitles.

**What went wrong:** Unreadable in both dark mode (40% lightness) and light mode (70% lightness). The token is designed for decorative/non-essential elements, not readable text.

**Lesson learned:** For any text that needs to be read, use `--text-grey` (75% dark / 45% light) as the minimum. Reserve `--text-light-grey` for purely decorative elements like borders or disabled states.

---

## 2026-03-24 — Never sacrifice visual synchronization for performance

**What was attempted:** Removed `backdrop-filter` from the `[data-link-card]` CSS transition list as a "performance optimization," reasoning that 1px blur is binary (on/off) and doesn't need to be animated.

**What went wrong:** This desynchronized the glass hover effect — blur would snap on instantly while `background`, `box-shadow`, and `border-color` still faded over 200ms. The result is a visible window where content distorts without the tinted fill. This is the same class of bug as a previous incident where backdrop-filter was missing during transitions and then popped on after — that was also called "imperceptible" but was clearly noticeable.

**Lesson learned:** All properties that compose a single visual effect must transition together. Never remove one property from a synchronized transition group for performance reasons — if they animate together, they must stay together. The glass hover is a coordinated effect: blur + tint + shadow + border are perceived as one thing. Desynchronizing any one of them breaks the illusion.

**Broader principle:** Don't dismiss visual changes as "imperceptible" or "nearly imperceptible" to justify a shortcut. If a change alters timing, synchronization, or the order in which visual properties appear, assume it's noticeable until proven otherwise by actually seeing it. Performance optimizations that touch visual properties need the same scrutiny as design changes — they ARE design changes.

**How to apply:** Before removing or altering any CSS transition/animation property, ask: "Is this property part of a coordinated visual effect?" If yes, don't touch it independently. Optimize the entire effect together or not at all.

---

## 2026-03-24 — Dead assets, late preloading, missing link attributes, and no cache headers shipped to prod

**What was attempted:** Multiple features shipped over time without a performance review step.

**What went wrong (4 separate issues, same root cause):**

1. **Dead 4.5MB Sony GIF in preload path.** When `sony-screenless` switched from GIF to `videoPreview`, the old GIF entry stayed in `projectImageMap`. The preload function downloaded it on every page load — 4.5MB of wasted bandwidth competing with the duo (230KB) and acorn (748KB) images that actually needed to load.

2. **Preview images preloaded too late.** `preloadPreviewImages()` was triggered by `onMouseEnter` on the left column instead of on mount. Fast users could hover a project before downloads had even started, causing blank image frames during the 300ms fade animation.

3. **Mochi link missing `target="_blank"` and `rel="noopener noreferrer"`.** Opened in the same tab, causing the React app to unmount (perceived slowness). LinkedIn and resume had the attributes; Mochi didn't. No consistency check existed.

4. **No cache headers on Netlify.** Static images, fonts, and hashed Vite output were served without explicit `Cache-Control` headers. Repeat visitors re-downloaded everything.

**Lesson learned:** Performance issues accumulate silently because no step in the workflow audits for them. Asset preloading, link hygiene, and caching are not covered by visual review. The fix:

- **Tests now exist** (`projectData.test.ts`, `preloadImages.test.ts`) that verify data integrity: no dead assets in preload paths, no oversized files in the preload pipeline, correct link/project data consistency.
- **Workflow updated** with a "Performance & production readiness" review step that checks preload paths, link attributes, and hosting config before merge.

**Scope:** Any time an asset's delivery method changes (e.g., GIF → video), the old reference must be removed from all maps. Any time an external link is added, verify `target="_blank"` and `rel="noopener noreferrer"`.

---

## 2026-03-22 — Cursor companion styling: plain text, not boxes or inverse colors

**What was attempted:** First implemented cursor companion labels with frosted-glass box styling (background, border, backdrop-filter). Then tried inverse/negative color styling matching the old invert cursor mode.

**What went wrong:** Boxes felt too heavy and cluttered next to the standard cursor. Inverse color looked odd — too high contrast and disconnected from the theme. Both distracted from the content rather than subtly signaling interactivity.

**Lesson learned:** Cursor companion cues should be minimal — plain text with theme-aware accent color, horizontally inline with the cursor (not below), no container styling. The goal is a gentle hint, not a tooltip. When adding visual elements near the cursor, less is always more.

---

## 2026-03-20 — lottie-react refs aren't available in onDOMLoaded with React.lazy

**What was attempted:** Used `lottieRef` + `onDOMLoaded` callback to call `goToAndStop(lastFrame)` on a lazy-loaded Lottie component, to show the final frame without replaying.

**What went wrong:** `lottieRef.current` was null when `onDOMLoaded` fired — the ref assignment happens after the callback due to React.lazy + Suspense timing. The Lottie rendered at frame 0 (initial state) instead of the last frame. A second attempt using a `useEffect` on `lottieData` had the same issue.

**Lesson learned:** For lazy-loaded lottie-react components, don't rely on ref timing. Instead, read the `op` (out-point) field directly from the Lottie JSON data and use the `initialSegment` prop: `initialSegment={[op - 1, op]}`. This declaratively clamps the animation to its final frame with no ref or callback needed.

---

## 2026-03-20 — Verify Phosphor icon exports before using them

**What was attempted:** Added `DotsThreeVertical` import from `@phosphor-icons/react` for a toggle button in the sidebar.

**What went wrong:** `DotsThreeVertical` doesn't exist in the installed version — the export resolves to `undefined`. In Vite dev mode, this silently broke the entire component module, causing the cursor section to disappear even when the toggle branch wasn't being rendered. The build (`vite build`) succeeded, masking the issue.

**Lesson learned:** Always verify icon exports exist before using them: `ls node_modules/@phosphor-icons/react/dist/csr/ | grep -i <name>`. Named imports that resolve to `undefined` can cause silent failures in Vite's dev server that don't reproduce in production builds. When a component partially fails to render in dev but builds fine, check for undefined imports first.

## 2026-03-20 — Toggle-to-expand doesn't work in fixed-height containers

**What was attempted:** Below 500px viewport, hid the cursor section behind a `...` toggle button. Clicking expanded the cursor section in-place.

**What went wrong:** The sidebar is `position: fixed` with no overflow handling. Expanding the toggle just appended controls below the visible area — they extended off-screen with no way to reach them. The toggle added content without making room for it.

**Lesson learned:** In fixed containers, showing/hiding content via toggle only works if the container can accommodate the expanded state (scrollable, or other content shifts to make room). If the container is already at capacity, a toggle just pushes content off-screen. Scroll is the correct overflow strategy for fixed containers — it handles any content length without hiding or shifting.

---

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

## 2026-03-20 — Verify browser/OS behavior before assuming code bugs

**What was attempted:** Spent extensive effort trying to fix a "double cursor" issue (OS cursor visible alongside custom cursor). Tried 7 different CSS/JS approaches, none worked.

**What went wrong:** The investigation assumed the issue was a code regression because "it wasn't happening before." Every fix targeted CSS cascade, timing, or specificity. In reality, `cursor: none` is broken at the browser/OS level in Chromium on macOS 26 (Tahoe). Building and testing the original "working" commit confirmed the same bug — no code change could fix it.

**Lesson learned:** When a CSS property that fundamentally should work doesn't, test across browsers early. If the same behavior reproduces on an old known-good commit, it's an environment change (browser update, OS update), not a code regression. Don't iterate on increasingly complex CSS workarounds without first isolating whether the issue is code vs. browser vs. OS. A 2-minute cross-browser test would have saved hours of investigation.

---

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
