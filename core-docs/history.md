# History

Decision log and completed work, in reverse chronological order.

## 2026-03-25 — Homepage layout: flat card list with two-line cards

**Branch:** `visual-ui-audit`

**Summary:** Redesigned homepage project layout from sectioned narrative to a flat card list. Each card shows title + Company · Year subtitle. Updated project metadata (years, company names), reordered projects by priority, fixed case study copy for external clarity, and added arrow keyframes to CSS. Removed dev toggle, InlineProjectLink, and section grouping code.

**Decisions:**
- Flat list over sectioned (by year / by company): sections added visual noise without earning it — the subtitle already carries year and company info, and chronological order communicates recency.
- Canonical order prioritizes current + personal work first, earlier work last.
- Company names expanded for clarity (e.g. "Sony × University of Washington").
---

## 2026-03-25 — Hover previews for non-project links

**Branch:** `hover-preview-links`

**Summary:** Added image/video hover previews for the four non-project links (resume, email, LinkedIn, Mochi Health). Hovering these links now cross-fades the right column to show a preview, using the same AnimatePresence system as project links. Resume and LinkedIn use static images; email and Mochi Health use looping MP4 videos.

**Decisions:**
- Extended HoverContext with `hoveredLinkId` / `setHoveredLinkId`, with mutual exclusion against `hoveredProjectId` (hovering one clears the other).
- Added `LinkPreview` type in `projects.ts` with optional `image` or `video` fields, keeping the data model parallel to project previews.
- Link previews use `object-fit: contain` (preserving original aspect ratio) rather than `cover` (which cropped the screenshots).

---

## 2026-03-24 — Back button arrow slide-out animation

**Branch:** `back-button-arrow-animation`

**Summary:** Added a slide-out animation to the back arrow (`←`) on case study pages. On click, the arrow does a brief rightward anticipation then accelerates left and fades out before the page transition fires. Uses `clipPath: inset(0)` to mask the arrow during exit. Mirrors the existing `arrowSlideOut` pattern from `ProjectLink.tsx`.

**Decisions:**
- Reused the same CSS keyframe injection approach as `ProjectLink` for consistency.
- Extended navigation delay from 280ms to 500ms to accommodate the animation.
- Respects `prefers-reduced-motion` — skips animation entirely.

---

## 2026-03-23 — Sony case study updates

**Branch:** `sony-case-study-updates`

**Summary:** Updated Sony case study page video to use 4:3 aspect ratio with `object-fit: cover`, matching the home page preview. Added "speculative project" framing across home page summary, case study subtitle, and narrative. Rewrote narrative opening for better flow — now leads with context (capstone at UW for Sony), transitions into research (interviewed people), then findings. Changed default case study contact CTA from "Interested in the details?" to "Want the details?"

**Decisions:**
- Used `data.id` check in `CaseStudyLayoutA` for Sony-specific video styling rather than adding a generic prop, since this is the only case study needing 4:3 cover treatment.

---

## 2026-03-23 — Disable glass hover on mobile/touch devices + /link command

**Branch:** `fix-mobile-glass-hover`

**Summary:** Fixed two mobile bugs: glass pill persisting after returning from a case study (no `mouseleave` to clear it), and back button requiring two taps (first tap triggered `focusin` glass activation). Added `/link` slash command that starts a dev server with a deterministic port derived from the workspace path, avoiding collisions across parallel worktrees.

**Decisions:**
- Gate glass pill at the hook level (`useGlassHighlight`) via `(pointer: coarse)` media query — matches existing CSS gate in `globals.css` and touch detection pattern in `CustomCursor`/`SidebarThemeControls`.
- Suppress `onFocus`/`onBlur` in `ProjectLink` on touch to prevent `hoveredProjectId` from being set (right column is hidden on mobile anyway).
- `/link` command verifies process ownership via `lsof -d cwd` before reusing a port, preventing cross-worktree conflicts.

---

## 2026-03-23 — Glass hover performance optimizations

**Branch:** `glass-hover-perf`

**Summary:** Reduced per-frame and per-mouseover DOM work in the glass highlight system. Cached `containerRect` in `getCardPosition` (was calling `getBoundingClientRect` on every position read), cached the section card list in `isCursorInCardStack` (was running `querySelectorAll` + `Array.from` + `filter` on every non-card mouseover), and removed the `backdrop-filter` CSS transition from `[data-link-card]` to avoid animating an expensive compositor property.

**Decisions:**
- `cachedSectionCards` invalidates on card change only (not scroll/resize) — the section-scoped card list is stable during a hover session; only the section context matters.
- `cachedContainerRect` reuses the existing invalidation points (scroll, resize, hover-start) established in `fix/glass-lean-inversion`.

---

## 2026-03-24 — External link fixes, performance, and production readiness

**Branch:** `fix-external-links-perf`

**Summary:** Fixed the Mochi Health link in `HeroTitle` to open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) — previously it navigated in the same tab, unmounting the React app. Moved `preloadPreviewImages()` from a lazy `onMouseEnter` handler in `LeftColumn` to app mount in `App.tsx` so images are ready before first hover. Removed dead `sony` GIF entry from `projectImageMap` (Sony uses `videoPreview` now, leaving a 4.5 MB GIF in the preload path). Added Netlify `Cache-Control` headers for hashed assets, images, fonts, and the resume PDF. Added two test suites: `projectData.test.ts` (validates `projectImageMap` integrity, no dead entries, project data consistency) and `preloadImages.test.ts` (verifies preload skips video/lottie, enforces 1 MB size limit).

**Decisions:**
- Fixed the specific Mochi link in `HeroTitle` rather than adding generic external-link handling to `ProjectLink`, since no project data currently uses external hrefs.
- Image preload moved to mount rather than `requestIdleCallback` for simplicity — the image set is small enough that eager loading is fine.
- Added `immutable` cache headers for Vite hashed assets (`/assets/*`) since content-hash filenames guarantee cache safety.

---

## 2026-03-23 — Vitest testing infrastructure

**Branch:** `testing-strategy`

**Summary:** Added Vitest as the project's test runner with 3 test suites covering `contribFill` (continuous count/maxCount scaling), `computeBg` (theme background computation), `formatDate`/`getTooltipText` (heatmap helpers), and `gridToBraille`/`DIRECTIONAL_SWEEP` (braille encoding). Exported 3 functions from `ContributionHeatmap.tsx` for testability. Added `vitest.config.ts` with `@` path alias.

**Decisions:**
- Tests target the continuous `count/maxCount` version of `contribFill` (from the heatmap contrast improvement on `next-update`), not the older discrete `level`-based version still on `main`.
- Used regex matching for floating-point assertions to handle IEEE 754 precision (e.g. `0.18 + 0.72 = 0.8999...`).

---

## 2026-03-23 — Fix glass pill lean inversion after scrolling

**Branch:** `fix/glass-lean-inversion`

**Summary:** Fixed an intermittent bug where the glass highlight pill's directional lean/tilt responded in the opposite direction from the cursor. Caused by `cachedContainerRect` going stale between hover sessions — scroll listeners are removed when no card is hovered, so scrolling between hovers left the cache holding the container's old viewport position, inverting the lean math.

**Decisions:**
- Invalidate `cachedContainerRect` at the start of every `handleMouseOver` and `handleFocusIn`. One extra `getBoundingClientRect` per hover-start is negligible — already happens every scroll frame.

---

## 2026-03-23 — Case study top spacing and sidebar alignment

**Branch:** `spacing-top-elements`

**Summary:** On narrow viewports, the case study page's back button and title had almost no gap, and the sidebar theme swatch was misaligned with the back button. Added 32px extra top padding to the narrow case study article, aligned the swatch horizontally with the back button via a responsive CSS variable (`--sidebar-trigger-top: 36px` at <900px, falling back to 64px on wide), and excluded the sidebar from view transitions so it stays steady during page navigation.

**Decisions:**
- Used a CSS custom property with media query rather than per-page JS overrides — avoids the swatch shifting position when navigating between pages.
- Gave the sidebar its own `view-transition-name: sidebar` with `animation: none` to keep it visually stable during route transitions.

---

## 2026-03-23 — Glass pill exit timing sync

**Branch:** `fix-glass-exit-timing`

**Summary:** Synced the glass highlight pill's fade-out with the left column content exit animation when navigating to a case study. The `useGlassHighlight` hook now returns a `fadeOut(duration, delay)` function; `LeftColumn` calls it with the same timing as the Framer Motion exit (280ms, 150ms delay). The `navigationFadeOut` also respects `prefers-reduced-motion` by zeroing duration/delay when active.

**Decisions:**
- Exposed `fadeOut` via a stable ref + `useCallback` pattern to avoid re-renders — the hook's imperative internals stay fully encapsulated.
- Reduced-motion check lives inside `navigationFadeOut` (not the caller) so accessibility is handled centrally.

---

## 2026-03-23 — Signature right-side inset

**Branch:** `signature-placement`

**Summary:** Added 16px right padding to the signature animation container. The signature was flush against the right edge of the content area, which made it feel like it was hanging off the boundary. The small inset gives it breathing room while keeping the right-aligned placement (which mirrors how people sign letters).

**Decisions:**
- Kept right alignment after evaluating left and center — right feels most "authored" and matches the design language's embrace of intentional asymmetry.
- 16px offset is enough to create air without pulling the signature noticeably toward center.

---

## 2026-03-23 — Hover summary polish: vertical centering + copy rewrites

**Branch:** `hover-summary-polish`

**Summary:** Vertically centered hover summary text in the right column by wrapping the `<p>` in a flex-centering `motion.div` container. Rewrote 7 project summaries (mochi-billing, mochi-ai-tooling, todo-priority, uw-system, sony-screenless, cip-misinfo, acorn-covid) to lead with context/tension before describing what was done. Added a summary to cip-misinfo which previously had none.

**Decisions:**
- Separated animation wrapper (`motion.div`) from semantic content (`<p>`) rather than applying flex directly to `<motion.p>` — cleaner separation of layout and semantics.

---

## 2026-03-23 — Copy polish, paper link cards, coming-soon treatment

**Branch:** `cip-copy-cleanup`

**Summary:** Removed "(CSCW 2025)" from CIP title; moved conference mention into body ("presented at CSCW 2025" with link). Paper links now render as Onest card-style items with arrows below the narrative, matching home page project links. Added `paperLinks` field to CaseStudy data model. Tightened section 2 intro copy ("Outside of work, I'm always building..."). Coming-soon projects no longer trigger right-column image swap; added back a minimal CursorCompanion that shows "coming soon" only on non-link cards (all cursor modes). Added 24px spacing above contribution heatmap.

**Decisions:**
- Paper links as card-style items (not inline HTML) keeps the narrative clean and gives papers the same visual weight as project links.
- "Presented at" rather than "published at" — CSCW is a conference; publication is in ACM proceedings.

---

## 2026-03-23 — Performance audit + Subframe removal

**Branch:** `perf-audit`

**Summary:** Broad performance pass — reduced unnecessary observers, memoized renders, code-split heavy dependencies, and removed the unused Subframe component library.

**Changes:**
- **ThemeContext**: Consolidated 3 separate `useEffect`s (data attributes, `--bg` variable, meta theme-color) into a single effect. Dispatches a `theme-changed` custom event so consumers don't need MutationObservers.
- **MutationObserver → custom event**: Replaced `MutationObserver` on `<html>` attributes with `theme-changed` event listener in CursorCompanion, CustomCursor, SidebarThemeControls, and useGlassHighlight. Fewer DOM observers, same reactivity.
- **useGlassHighlight**: Scroll/resize listeners are now lazy — added only when a card is hovered, removed when the highlight fades out.
- **ContributionHeatmap**: Memoized cell fill colors with `useMemo` instead of recomputing `contribFill()` per cell on every render.
- **SignatureAnimation**: Code-split via `React.lazy` + `Suspense` so `@rive-app/react-canvas` is not in the main bundle.
- **SidebarThemeControls**: During intensity slider drag, bypasses React state updates and uses direct DOM writes for zero-lag feedback. Commits final value to state on pointer up.
- **CursorCompanion positioning fix**: Moved target detection (what's under cursor) before position calculation so `leftSide` is correctly set before the label's x-coordinate is computed. Fixes a glitch where the companion would briefly appear on the wrong side.
- **Subframe removal**: Deleted all `src/ui/` files (44 components, layouts, utils, theme), `.subframe/sync.json`, `@subframe/core` from dependencies, Subframe theme overrides from `theme.css`, and the Subframe CSS import from `globals.css`. Updated CLAUDE.md to reflect removal.

**Decisions:**
- Custom event dispatch (`theme-changed`) chosen over a pub/sub system because listeners are all vanilla DOM code (not React components), and custom events integrate naturally with `addEventListener`/`removeEventListener` cleanup.
- Lazy scroll/resize listeners in useGlassHighlight preferred over `{ passive: true }` alone — no listener at all is cheaper than a passive one when no highlight is active.

---

## 2026-03-23 — Condensed case studies, AI tooling narrative, typography fix

**Branch:** `single-page-strategy`

**Summary:** Wrote full AI tooling case study narrative (2 paragraphs: institutional knowledge gap → composable skills plugin). Rewrote Trio narrative to focus on the personal problem and product mechanics. Enabled AI tooling as a linked project. Fixed case study typography: narrative paragraphs now use Literata 300 22px (matching home page editorial voice) instead of Onest 400 18px. Title reduced from 36px to 28px for proportional fit with longer case study titles. Minor copy tweaks on Progress Tracker and UW Design System.

**Decisions:**
- Case study narrative uses same two-voice system as home page: Literata for editorial, Onest for functional. Previous mismatch (Onest on case studies) broke the design language.
- Title at `--text-size-section-heading` (28px) instead of `--text-size-title` (36px) — long case study titles wrap to 3+ lines at 36px on a 50% column.

---

## 2026-03-23 — Interface polish: selection color, hover gating, tap highlights

**Branch:** `interface-audit`

**Summary:** Fixed text selection highlight using wrong token (`--text-light` → `--text-dark` for legibility against accent swatch). Wrapped CSS glass hover effects in `@media (hover: hover)` so touch devices don't get stuck hover states. Added `-webkit-tap-highlight-color: transparent` on interactive elements. Added `userSelect: 'none'` on sidebar controls (accent swatches, mode/cursor toggles) to prevent accidental text selection when clicking. Added `text-rendering: optimizeLegibility` and `-webkit-text-size-adjust: 100%` to html. Added `tabular-nums` to contribution count text.

**Decisions:**
- Separated `:hover` and `:focus-visible` glass styles so hover can be media-gated while focus-visible remains always available for keyboard/touch.

---

## 2026-03-22 — Contribution heatmap contrast improvement

**Branch:** `contribution-graph-contrast`

**Summary:** Replaced discrete 5-level bucket fill in the contribution heatmap with continuous intensity scaling using `Math.sqrt(count / maxCount)`. Empty cells get explicit near-invisible treatment (alpha 0.05). Active cells scale alpha 0.18–0.90 and saturation 30%–70%, producing better perceptual contrast between sparse and busy days.

**Decisions:**
- Switched from level-based to count-based fill to avoid bucketing artifacts.
- Used square-root scaling to spread low-count days more visibly across the gradient.

---

## 2026-03-22 — Cursor companion cues (arrows + "coming soon")

**Branch:** `mobile-cursor-theme-fix`

**Summary:** Added a CursorCompanion component that shows contextual text cues alongside the standard browser cursor: → on project links, ← on back links (positioned left of cursor), and "coming soon" on non-link projects. Theme-aware accent coloring, respects `prefers-reduced-motion`. Disabled invert cursor mode. Added mobile/touch support for sidebar (click-to-toggle, touch-outside-to-close, hidden cursor controls). Documented CursorCompanion in `design-language.md`.

**Decisions:**
- Abandoned custom cursor (cursor:none) due to Chromium macOS Tahoe bug where standard cursor stays visible. Instead, companion labels work *with* the standard cursor as add-ons.
- Plain text (no box/pill) with horizontal inline positioning — boxes and inverse colors were tried and rejected as too heavy.
- Figpal kept as separate mode with its own interactivity cues; companion only active in standard mode.
- Sidebar uses click-to-toggle (not hover) on touch/narrow viewports; cursor controls hidden entirely on touch since custom cursors don't apply.

---

## 2026-03-21 — Narrative copy refresh + tooltip clamp

**Branch:** `lean-into-building`

**Summary:** Revised all left-column narrative text to better communicate: solid job with responsibility, prolific personal building, and range of prior experience. Also fixed contribution heatmap tooltip clipping on left/right edge cells.

**Changes:**
- Section 1: "These days" → "Lately" + concrete AI framing ("building AI into how my team designs and ships")
- Section 2: "On the side..." → "When I'm off the clock, I spend a lot of time building things..."
- About p1: "I like working through..." → "I do my best work shaping early stage ideas..."
- Heatmap tooltip: left-aligns near left edge, right-aligns near right edge instead of always centering

---

## 2026-03-21 — Rive signature color fix

**Branch:** `rive-signature-dark-text`

**Summary:** Fixed Rive signature animation color to match the `--text-dark` token. Changed `invert()` filter from 0.75/0.45 to 0.99/0.07 (dark/light) so the signature reads as near-white in dark mode and near-black in light mode, consistent with primary text.

---

## 2026-03-21 — Hover preview debounce (no flash between cards)

**Branch:** `hover-preview-debounce`

**Summary:** Added a 150ms debounce to `HoverContext.setHoveredProjectId` so that clearing hover state (`null`) is delayed, while setting a new project ID is immediate. This prevents the preview image from flashing back to the default portrait when moving the cursor between project cards.

**Decisions:**
- Implemented in HoverContext (option 1: centralized) rather than per-ProjectLink, so all consumers benefit automatically.
- 150ms delay matches the glass pill's `clearDelay` to keep both systems in sync.

---

## 2026-03-21 — Remove visuals from UW case study left column

**Branch:** `uw-remove-left-visuals`

**Summary:** Removed all prototype iframes and gallery items from the UW Design System case study. The left column now shows text-only sections, matching the presentation of other case studies.

**Decisions:**
- Set all three section visuals to `null` and emptied the gallery array. Consistent with Trio, CIP, Sony, and Acorn case studies.

---

## 2026-03-21 — Video previews + title sync

**Branch:** `mochi-video-preview`

**Summary:** Added video hover preview for the Mochi AI tooling project (with summary text). Replaced Mochi subscriptions and UW design system preview videos with updated cuts. Synced all case study page titles to match their home page counterparts.

**Decisions:**
- AI tooling video preview works on hover even though the project link is inactive (coming soon).
- Case study titles made authoritative from `projects.ts` (home page) — 5 titles updated in `case-study-content.ts`.

---

## 2026-03-21 — Coming soon labels, glass hover scoping, resume update

**Branch:** `coming-soon-label`

**Summary:** Replaced `…` ellipsis with `(coming soon)` on unlinked project cards. Fixed glass hover pill persisting on the last card when cursor moves to narrative text between sections. Updated resume PDF.

**Decisions:**
- Glass `isCursorInCardStack` now scopes to the `<section>` containing the current card, so narrative paragraphs between sections properly clear the pill while card-to-card transitions within a section remain smooth.
- Removed `aria-hidden` from the "(coming soon)" span since it's meaningful text for screen readers.

---

## 2026-03-21 — Trim and reorder contribution heatmap

**Branch:** `trim-contribution-grid`

**Summary:** Contribution grid now trims to the last week with data (no empty future columns), making cells scale up responsively to fill width. Month labels moved from SVG to HTML so they stay at a fixed 11px regardless of column count. Reordered layout: context text ("807 contributions...") and GitHub link moved above the grid, month labels below.

**Decisions:**
- Month labels rendered as HTML `<span>` elements with percentage-based positioning rather than SVG `<text>` — prevents labels from scaling with the viewBox when column count is low.
- Tooltip container ref moved from `<section>` to `data-glass-break` div to keep tooltip positioning correct after reordering.
- Updated CustomCursor hardcoded SVG coordinate math to match new grid origin (y=0, no LABEL_TOP offset).

---

## 2026-03-21 — Starbird honorific + glass links on paper citations

**Branch:** `starbird-hero-glass-links`

**Summary:** Changed "Kate Starbird" to "Dr. Kate Starbird" in the CIP election misinfo case study subtitle. Added glass highlight hover effect to the two paper citation links, matching the treatment used on home page contact links (email, LinkedIn, resume).

**Decisions:**
- Reused `useGlassHighlight` hook in `CaseStudySectionText` with `data-paper-link` selector — same pattern as `AboutSection`'s contact cards. Safe for all case study sections since the hook is inert when no matching elements exist.
- Paper links get `padding: 4px 8px` + negative margin + `display: inline-block` so the glass pill has space to render around them.

---

## 2026-03-21 — Add favicon, meta assets, and signature animation

**Branch:** `update-favicon`

**Summary:** Added site favicon (64px signature mark), Apple touch icon (180px), Open Graph image with social meta tags, and a Rive signature path animation at the bottom of the home page that triggers on scroll — like signing a letter.

**Decisions:**
- Rive animation color matched to `--text-grey` via CSS `invert()` filter, adapting to light/dark mode without editing the .riv binary.
- Signature placed after AboutSection with 24px top padding (between-links spacing tier) to feel like a natural sign-off, not a separate section.
- OG image hardcoded to `https://benyamron.com/og-image.png` for social previews.

---

## 2026-03-21 — Add Duo hover preview image

**Branch:** `duo-hover-preview`

**Summary:** Added `preview-duo.png` (Duolingo loading screen device frame) as the hover preview for the "Making Duolingo's use of flags more inclusive" project link. Added `'duo-flags'` to the `needsShadow` set in ImageDisplay since the white device frame background needs separation in light mode.

**Decisions:**
- Added to `needsShadow` set to match Acorn's treatment (same device frame style, same white background concern).

---

## 2026-03-21 — Fix figpal sidebar image rendering

**Branch:** `fix-figpal-sidebar-image`

**Summary:** Fixed the figpal icon in the sidebar theme controls not displaying correctly. The image file was deleted in a prior PR (fix-case-study-heroes) as "unused" but the sidebar and custom cursor still reference it. Restored `figpal.png` to `public/images/` and improved rendering from fixed 18×18 box to `height: 22, width: auto` for natural aspect ratio.

---

## 2026-03-21 — Reorder sections: side projects between Mochi and earlier work

**Branch:** `reorder-side-projects`

**Summary:** Moved side projects and GitHub contribution graph to appear between the Mochi section and the earlier work section. Updated the "Before Mochi" context text to "Since I started designing in 2020, I've explored challenges across different domains." Updated `afterContext` in LeftColumn to render `ContributionHeatmap` after the side projects section (index 1) instead of the last section.

---

## 2026-03-20 — Fix case study hero transitions and cleanup

**Branch:** `fix-case-study-heroes`

**Summary:** Fixed hero images/videos not transferring from home to case study pages. Added video rendering support to CaseStudyLayoutA (Mochi Subs, UW, Todo). Fixed Lottie replay on CIP page (shows final frame via `initialSegment`). Added `viewTransitionName` to video and Lottie elements for smooth View Transition morphing. Fixed gallery layout breaking UW page (was inside flex-row, now outside). Cleaned up shared projectIds and removed unused assets.

**Decisions:**
- Gave every project a unique `projectId` — no more borrowing images across case studies. Projects without dedicated images fall back to the accent portrait.
- Deleted `preview-uw.png` (UW uses its video preview) and `figpal.png` (unused). Removed `uw`, `cip`, `mochi-tracker` entries from `projectImageMap`.
- Used Lottie's `initialSegment` prop (reading `op` from JSON data) instead of ref-based `goToAndStop` — avoids timing issues with lazy-loaded components.
- UW case study title updated to match home page: "Building the system that builds the system".
- CIP case study restructured: first paragraph + two papers with linked titles, full abstracts, italic author/journal lines.
- Added `preview-duo.png` as Duolingo hover image with drop shadow.

---

## 2026-03-20 — Fix portrait image aspect ratio and update resume

**Branch:** `fix-theme-image-aspect`

**Summary:** Fixed the right-column portrait image appearing wider than intended at large breakpoints. Added `aspectRatio: '528 / 720'` to the portrait style so the image maintains its original proportions regardless of container width — height drives sizing, width follows the ratio. Also updated the resume PDF to the March 26 version.

**Decisions:**
- Portrait uses `height: 100%` + `maxWidth: 100%` + `aspectRatio: 528/720` with `object-fit: cover` — this ensures the image fills available height while staying at the correct ratio, only scaling down width at smaller sizes.

---

## 2026-03-20 — Updated resume PDF

**Branch:** `update-resume-file`

**Summary:** Replaced `public/ben-yamron-resume.pdf` with the March 26, 2026 version. Straightforward file swap — no code changes.

---

## 2026-03-20 — Polish case studies for public launch

**Branch:** `polish-case-studies`

**Summary:** Cleaned up case study pages so the site looks finished for publicizing. Removed gray placeholder images (kept prototype iframes). Settled on sticky-hero two-column layout (title+description left, hero image sticky right, body text scrolls underneath). Added Trio todo list as a full case study. Added Lottie animation as hero for the CIP misinfo case study with linked papers. Commented out progress tracker project.

**Decisions:**
- Gray-only PlaceholderVisuals removed from case study layout; prototype iframes (with prototypeSrc) preserved — visuals will be added later as real images, not gray boxes.
- Paragraphs in case study body now support inline HTML (via `dangerouslySetInnerHTML`) matching the pattern used in the home page `Section` component, enabling paper links in the CIP study.
- Paragraph spacing increased (24→32px margin, 1.4→1.5 line-height) for better readability.

---

## 2026-03-20 — Add video hover preview for todo list project

**Branch:** `todo-list-hover-video`

**Summary:** Added `preview-todo-priority.mp4` as the hover preview for the "A todo list that keeps tasks perfectly prioritized" side project. Used the existing `videoPreview` field on the Project interface (established by the Mochi Subscriptions video PR).

**Encoding:** Source was a 982×736 .mov (7.3MB). Encoded to 528px width (matching the display container) using H.264 Main profile, CRF 18 (visually lossless), `faststart` flag. Final size: 460KB — 16× smaller than source, smaller than the mochi-subs preview (632KB).

**Encoding note:** macOS `avconvert` only remuxes containers without recompressing. Used `ffmpeg-static` (npm) for proper CRF encoding. `avconvert` at 640×480 still produced 4.7MB; ffmpeg at 528px with CRF 18 achieved 460KB.

---

## 2026-03-20 — Responsive sidebar theme controls

**Branch:** `theme-sidebar-responsive`

**Summary:** Made the sidebar theme controls responsive to viewport height. Controls compress smoothly between 740px and 500px viewport (swatch sizes, gaps, button sizes, intensity strip all scale via linear interpolation). Below max compression, the toolbar becomes scrollable with a hidden scrollbar. Added horizontal padding to prevent outline clipping within the scroll container.

**Decisions:** Tried a collapsible toggle approach first (hide cursor section behind a `...` button below 500px) — rejected because expanding the toggle just added content off-screen without shifting anything. Compression + scroll is simpler and handles all viewport heights without hiding controls. Also discovered `DotsThreeVertical` doesn't exist in the installed Phosphor icons version — caused a silent module failure in Vite dev mode.

---

## 2026-03-20 — UW Alert prototype + video hover preview support

**Branch:** `uw-alert-prototype`

**Summary:** Built a self-contained HTML prototype of a "Solstice" design system Alert component documentation page (`public/prototypes/uw-alert.html`) as a portfolio case study artifact for the UW Design System project. Also added video (.mp4) support to the hover preview system so the UW project shows a screen recording on hover.

**What changed:**
- `public/prototypes/uw-alert.html` — Full design system documentation page prototype: alert component variants (critical, warning, info), props table, do/don't guidelines, code snippets with framework switcher (HTML/Vue/Angular), sidebar navigation, TOC with scroll tracking, draggable resizable sidebar. Uses exact Solstice component styling (pill-shaped alerts, thin uniform borders, ghost CTA buttons).
- `public/prototypes/uw-preview.mp4` — Screen recording video for UW project hover preview.
- `src/data/projects.ts` — Added `videoPreview` optional field to `Project` interface. Set `videoPreview: '/prototypes/uw-preview.mp4'` on the `uw-system` project entry.
- `src/components/ImageDisplay.tsx` — Added video rendering path: `<motion.video>` with autoPlay, muted, loop, playsInline. Video takes priority over Lottie, which takes priority over static images. Same cross-fade animation and border-radius as other preview types.

**Key decisions:**
- **Video as third media type** alongside Lottie and static images, using the same per-project override pattern (`videoPreview` field, like `lottiePreview`).
- **Self-contained prototype** — single HTML file with inline CSS + JS, no build step. Lives in `public/prototypes/` so it's served directly by Vite.
- **Draggable sidebar** in prototype for flexible viewing.
- **Exact color palette** from Solstice design system for alert variants.

**Files changed:** ImageDisplay.tsx, projects.ts, public/prototypes/uw-alert.html, public/prototypes/uw-preview.mp4

---

## 2026-03-20 — Video hover preview for Mochi Subscriptions

**Branch:** `mochi-hover-video`

**Summary:** Added video preview support to `ImageDisplay` and set the Mochi Subscriptions project to show an MP4 on hover. Video renders with autoplay, muted, loop, playsInline — same contain-mode layout and 300ms cross-fade as other preview types.

**Changes:** Added `videoPreview` field to `Project` interface, video rendering branch in `ImageDisplay.tsx` (priority: video > Lottie > static image), and `preview-mochi-subs.mp4` in `public/images/`.

---

## 2026-03-20 — Double cursor: diagnosed as Chromium/macOS Tahoe bug

**Branch:** `fix-double-cursor-v2`

**Summary:** Investigated the persistent double cursor issue (OS cursor visible alongside custom cursor). After exhaustive testing, determined this is a browser/OS-level bug in Chromium on macOS 26 (Tahoe), not a code issue. No code changes shipped — all experimental fixes were reverted.

**Investigation findings:**
- `cursor: none !important` is completely ignored by Chromium-based browsers (Chrome, Brave, Dia) on macOS 26 once the user moves the mouse
- Tested every CSS cascade approach: stylesheet rules, `<style>` tag injection, inline `!important` via `setProperty`, `mouseover` enforcement on every element — all fail
- Transparent cursor images (`cursor: url(transparent.png)`) also fail
- Built and tested the original working commit (`b889dc6`) — same bug. Confirms no code regression.
- **Safari handles `cursor: none` correctly** (minor flicker during active scroll momentum only)

**What did NOT work:**
1. CSS class toggle + `globals.css` rule
2. Dynamic `<style>` injection (`* { cursor: none !important; }`)
3. Transparent SVG data URI cursor
4. `<style>` tag in HTML `<head>` (before all CSS/JS)
5. Inline `!important` via `element.style.setProperty('cursor', 'none', 'important')`
6. `mouseover` event listener enforcing inline `!important` on every hovered element
7. 32×32 transparent PNG cursor image

**Decision:** Accept the limitation. The current class-toggle implementation works correctly in Safari. Chromium will likely fix this in a future update. Documented in `design-language.md`.

---

## 2026-03-19 — Add /push custom command for Claude Code

**Branch:** `push-skill`

**Summary:** Created a `/push` slash command (`.claude/commands/push.md`) that automates the full ship workflow: update core docs, commit, open a PR to `next-update`, and merge. Reduces manual steps when shipping feature work.

**Decisions:**
- **Targets `next-update` by default** — Follows the branching strategy from `core-docs/workflow.md`. Deploys only happen on `next-update → main`.
- **Squash merge + delete branch** — Keeps `next-update` history clean.
- **Committed directly to `main`** — This is project tooling, not a feature. Needs to be available to all branches immediately.

---

## 2026-03-19 — Add UW design system hover preview image

**Branch:** `uw-hover-image`

**Summary:** Added hover preview image for the UW design system case study (`preview-uw.png`). Previously the `projectImageMap` referenced a non-existent `preview-uw.jpg`. Copied the exported Alert component screenshot and updated the file extension in `projects.ts`.

**Decisions:**
- **Kept shared `uw` projectId** — Multiple projects share this ID, and this is the first preview image for it. No need to split IDs yet.
- **PNG format** — Source export was PNG; updated the reference from `.jpg` to `.png`.

---


## 2026-03-19 — Responsive image alignment + cover portrait

**Branch:** `expand-two-column-range`

**Summary:** Improved right-column image alignment across viewport sizes. Portrait images now fill the column with `object-fit: cover` (slight side cropping at compact widths), while hover previews stay `contain` (no cropping). The right column switches from centered to top-aligned at compact two-column widths (900–1199px) so the portrait's top edge aligns with the heading baseline.

**What changed:**
- `src/components/RightColumn.tsx` — Responsive `justifyContent`: centered at 1200px+, `flex-start` at 900–1199px via `useIsCompactTwoColumn()` hook.
- `src/components/ImageDisplay.tsx` — Portrait uses `object-fit: cover` with `overflow: hidden` + `borderRadius: 32` wrapper. Previews use `object-fit: contain` with centered flex + bottom padding for text zone. Same absolute-fill container for both — no layout shift on hover.
- `src/hooks/useMediaQuery.ts` — Added `useIsCompactTwoColumn()` hook (true at 900–1199px).
- `core-docs/design-language.md` — Updated responsive behavior and image rules sections.

**Decisions:**
- **Cover for portraits, contain for previews** — Portraits are controlled assets with centered subjects; side cropping at compact widths (~11–17%) is acceptable. Previews vary in aspect ratio and should never be cropped.
- **Responsive alignment, not universal** — Centering works at wide viewports (image fills 89–93% of height). Top-alignment only kicks in at compact widths where the centering gap becomes visually disconnected from the left column's heading.
- **Same container for both** — No layout shifting between portrait and preview states. The cross-fade handles the transition between the large cover portrait and the smaller contained preview.

---

## 2026-03-17 — Reduce glass highlight wiggle

**Branch:** `reduce-glass-wiggle`

**Summary:** Tuned 4 physics constants in the glass highlight hook to make the pill's edge-responsive lean and tilt more subtle. The effect should reward deliberate edge-seeking without distracting during casual browsing.

**What changed:**
- `src/hooks/useGlassHighlight.ts` — Updated 4 constants: `deadZone` 0.7→0.78, pull curve exponent 1.5→2.0, `maxLean` 3→2.5px, `maxTilt` 1.0°→0.75°.
- `core-docs/design-language.md` — Updated glass pill lean/tilt spec to match the new constants with clarifying editorial framing.

**Decisions:**
- **Larger dead zone (0.78)** — The cursor must now be within ~22% of the edge to trigger any movement, reducing accidental activation.
- **Steeper pull curve (2.0)** — Response ramps up more steeply near the boundary rather than easing in early, creating a "barely-there until you notice it" feel.
- **Lower maxLean/maxTilt** — Reduced from 3px/1.0° to 2.5px/0.75° for a subtler overall effect.

---

## 2026-03-17 — Fix double cursor bug

**Branch:** `fix-double-cursor`

**Summary:** Fixed double-cursor issue where both the native OS cursor and the custom cursor were visible simultaneously. The root cause was the dynamic `<style>` tag injection approach for hiding the native cursor — race conditions or specificity conflicts could cause the injected style to fail or be duplicated.

**What changed:**
- `src/components/CustomCursor.tsx` — Replaced `document.createElement('style')` / `document.head.appendChild()` approach with `document.documentElement.classList.add('cursor-none')` / `.remove('cursor-none')`. Simpler, no DOM element creation/removal.
- `src/styles/globals.css` — Added static CSS rule targeting `html.cursor-none` and descendants (including `::before`/`::after` pseudo-elements) with `cursor: none !important`.
- `core-docs/design-language.md` — Updated "Global cursor suppression" description to reflect the new class-toggle mechanism.

**Decisions:**
- **CSS class toggle over style injection** — Static CSS rules are more reliable than dynamically injected `<style>` elements. No race conditions, no duplicate elements, easier to debug in DevTools.
- **Broader selector coverage** — New rule explicitly targets `::before` and `::after` pseudo-elements, which the old `*` selector didn't cover.

---

## 2026-03-16 — Sidebar backdrop (variant E) chosen for sidebar-image overlap

**Branch:** `sidebar-overlap-fix`

**Summary:** At narrow two-column widths (1200–1439px), the sidebar controls overlap the right-column portrait image. After prototyping five approaches with a dev toggle panel, chose variant E (sidebar atmospheric zone — a feathered blur zone behind controls on hover) as the permanent solution.

**Why variant E wins:**

- **Preserves the full sidebar design language.** Vertical layout, intensity strip, stagger animations, 64px trigger alignment — all intact.
- **Extends the existing glass vocabulary.** The backdrop is another frosted, accent-tinted, momentary surface — same material philosophy as the glass pill on project cards and sidebar controls.
- **Solves through craft, not avoidance.** A 300px-wide element with a 6-stop `mask-image` S-curve produces a smooth blur falloff with no visible hard edge.
- **Performance-safe.** Uses `AnimatePresence` to mount/unmount the backdrop (zero compositing cost at rest), `will-change: opacity`, `contain: strict`, and `prefers-reduced-motion` disables blur entirely. Framer Motion's `useReducedMotion()` hook sets the opacity animation duration to `0` for reduced-motion users.

**Rejected alternatives:**

- **Variant A** (extra right padding) — wasted space at wider viewports.
- **Variant C** (fluid column split) — over-engineered for a narrow viewport range.
- **Variant D** (top bar) — required removing the intensity strip (dealbreaker), introduced a foreign layout pattern.
- **Original D** (left sidebar) — replaced by top bar, itself rejected.

---

## 2026-03-16 — Fix glass pill persisting across hover gaps

**Branch:** `fix-hover-gap-behavior`

**Summary:** Fixed the glass highlight pill staying alive when the cursor moved through gaps between unrelated content areas. The "Mochi Health" inline link in the hero shares the project card pill container (so the pill can slide between them), but its inclusion in the `isCursorInCardStack` bounds calculation extended the "stack" from the hero text all the way down to the last project card — keeping the pill alive in the large gap between the hero and the projects section.

**What changed:**
- `src/hooks/useGlassHighlight.ts` — `isCursorInCardStack` now filters out cards with `data-tight-bounds` from the stack span calculation. These cards (e.g. "Mochi Health") aren't adjacent to the project card list and would stretch the stack bounds across unrelated content. The pill can still slide to/from tight-bounds cards via the existing `handleMouseOver` logic; this only affects the "is the cursor still in the stack?" check that prevents premature clearing.

**Decisions:**
- **Filter by `data-tight-bounds` attribute** rather than by position or a separate selector. The attribute already exists for per-card tight bounds behavior, so reusing it here keeps the system consistent.
- **Kept `clearDelay` at 150ms** — the original documented value. Tested 350ms as an alternative but it offered no perceptible improvement once the stack bounds were fixed. The filter was the real fix; the delay increase was unnecessary.

---

## 2026-03-15 — Deploy tracking and next-update branching strategy

**Branch:** `deploy-tracking-workflow`
**PR:** #57

**Summary:** Introduced a staging branch (`next-update`) and deploy tracking system to manage Netlify's 20 deploys/month limit (billing cycle resets on the 14th). Feature branches now merge into `next-update` instead of `main`. Only intentional `next-update → main` merges trigger deploys. Created `core-docs/deploys.md` to track deploy count per cycle.

**What changed:**
- `core-docs/deploys.md` (new) — Deploy tracker with current cycle table, branching strategy reference, and archive section for previous cycles. Seeded with 5 deploys from the current cycle (PRs #53–#56 + one automated commit).
- `core-docs/workflow.md` — Added steps 11 (Branching and Deploy Strategy) and 12 (Deploy Awareness). Claude must report deploy count at conversation start, warn before merges to `main`, update the tracker after merges, and nudge if `next-update` has 3+ undeployed PRs or 7+ days since last deploy.
- `CLAUDE.md` — Added `deploys.md` to the core docs table. Added deploy awareness and branching rules to the "Rules for core docs" section.

**Decisions:**
- **`next-update` as staging branch** — Simpler than per-environment branches. All feature work accumulates here; batching multiple features into one `main` merge conserves deploy credits.
- **Nudge thresholds (3 PRs or 7 days)** — Balances between not nagging and not letting features sit undeployed too long.
- **Billing cycle tracking in a doc** — Lightweight, no tooling needed. Claude updates it as part of workflow.

---

## 2026-03-15 — Fix preview image overlap in right column

**Branch:** `fix-preview-image-overlap`

**Summary:** Fixed preview images overflowing their container and overlapping the summary text zone in the right column. The static image path (`<motion.img>`) was using `maxWidth`/`maxHeight` constraints directly on the `<img>` element, which didn't reliably contain the image within the text zone reservation. Wrapped the image in a flex-centering `<motion.div>` container (matching the Lottie path's approach) so padding-based containment works consistently.

**What changed:**
- `src/components/ImageDisplay.tsx` — Replaced the bare `<motion.img>` with a `<motion.div>` wrapper using `position: absolute; inset: 0` and `display: flex; alignItems: center; justifyContent: center`. Preview padding (`0 5% ${TEXT_ZONE_HEIGHT + 24}px`) is applied to the wrapper div. The inner `<img>` uses `maxWidth: 100%; maxHeight: 100%` to fill available space without overflow. This matches the Lottie container's pattern for consistent sizing.

**Decisions:**
- **Wrapper div approach** — Using a flex container with padding is more reliable than `maxWidth`/`maxHeight` calc constraints on the image itself. The Lottie path already used this pattern; now both paths are consistent.
- **Changed `<motion.img>` to plain `<img>` inside `<motion.div>`** — The animation (opacity fade) is handled by the wrapper, so the inner image doesn't need Framer Motion props.

---

## 2026-03-15 — Performance audit: image compression, preloading, RAF optimizations, bundle splitting

**Branch:** `perf-audit-optimize`

**Summary:** Comprehensive performance optimization pass — compressed all portrait images (~5 MB total savings), added image preloading for instant theme switching and hover previews, optimized CustomCursor and glass highlight animation loops to avoid idle CPU usage and layout thrash, split vendor bundles for better caching, and lazy-loaded the Lottie library.

**What changed:**
- **Image compression** — All 5 portrait images in both `public/images/` and `src/assets/images/` re-compressed (e.g., `portrait-portrait.jpeg` 1.98 MB → 165 KB, `portrait-pizza.jpeg` 1.81 MB → 299 KB).
- `src/utils/preloadImages.ts` (new) — Shared preload utility with deduplication via module-level `Set`. `preloadPortraitImages()` called on mount in `App.tsx`; `preloadPreviewImages()` called on first `mouseEnter` in `LeftColumn.tsx`.
- `index.html` — Added `<link rel="preload">` for the default table-theme portrait for earliest possible load.
- `src/components/CustomCursor.tsx` — Animation RAF loop now runs only when needed: stops when cursor settles (delta < 0.5px), restarts on `pointermove`. Fixed orphaned animation frame bug by setting `loopRunning = true` before initial `requestAnimationFrame` schedule.
- `src/hooks/useGlassHighlight.ts` — Cached `container.getBoundingClientRect()` (invalidated on scroll/resize instead of every frame). Width/height style writes gated on actual pixel change. Scroll handler defers recalc to next RAF via dirty flag. Fixed single-rAF bug: replaced with actual double-rAF to ensure paint boundary between `transition: 'none'` and `fadeIn()`.
- `vite.config.ts` — Manual Rollup chunk splitting: `react`/`react-dom`/`react-router-dom` → `vendor-react`, `framer-motion` → `vendor-motion`.
- `src/components/ImageDisplay.tsx` — `lottie-react` changed from static import to `React.lazy()` + `<Suspense>` for deferred loading.

**Decisions:**
- Image preload functions share a module-level `preloaded` Set for deduplication across callers, justifying co-location in `src/utils/`.
- Cursor loop uses a `loopRunning` guard + `startLoop()` pattern to avoid continuous RAF when cursor is stationary.
- Glass highlight uses `scrollDirty` flag to batch scroll-triggered recalcs into RAF ticks rather than synchronous `getBoundingClientRect` in scroll handlers.
- Double-rAF chosen over forced reflow (`void offsetHeight`) to separate style write batches across paint boundaries without blocking the main thread.

**Bugs fixed during review:**
- `CustomCursor.tsx` — Initial RAF schedule didn't set `loopRunning = true`, allowing `startLoop()` to create a second concurrent loop on early `pointermove`. Fixed by setting flag before schedule.
- `useGlassHighlight.ts` — Comment said "Double-rAF" but code was single `requestAnimationFrame`. Fixed to actual nested double-rAF in both `handleMouseOver` and `handleFocusIn` paths.

---

## 2026-03-15 — Cursor fixes: GitHub arrow morph and sidebar order

**Branch:** `cursor-fixes`

**Summary:** Fixed the custom cursor showing the large invert circle on the GitHub link instead of the arrow morph, and reordered the cursor style options in the sidebar.

**What changed:**
- `src/components/ContributionHeatmap.tsx` — Imported `useHover` and added `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` handlers to the GitHub link that set `hoveringLink` via HoverContext. This triggers the arrow cursor morph (same pattern as LinkedIn/email/resume links in AboutSection).
- `src/components/SidebarThemeControls.tsx` — Reordered `cursorOptions` array from circle → standard → figpal to circle → figpal → standard, matching the desired top-to-bottom sidebar order.

**Decisions:**
- Followed the existing `AboutSection` pattern for link hover detection rather than adding `data-contact-card` to the GitHub link, since the heatmap section has its own glass highlight setup with `data-link-card`.

---

## 2026-03-14 — Netlify deployment config and TypeScript strict index safety

**Branch:** `netlify-deploy`

**Summary:** Added Netlify deployment configuration for SPA hosting and fixed TypeScript strict index access errors across three files to satisfy `noUncheckedIndexedAccess`.

**What changed:**
- `netlify.toml` (new) — Build command (`npm run build`), publish directory (`dist`), and catch-all SPA redirect (`/* → /index.html`, status 200).
- `src/components/ContributionHeatmap.tsx` — Added nullish coalescing fallbacks on `BASE_SAT[level]`, `BASE_ALPHA[level]`, `MONTHS[m]`, and `grid[w]`/`week[d]` access. Extracted `grid[w]` into a local `week` variable with a guard clause.
- `src/components/SidebarThemeControls.tsx` — Fixed TypeScript error on `webkitBackdropFilter` via type cast. Added `??` fallback on `accents[0]`.
- `src/contexts/ThemeContext.tsx` — Added `?? 'table'` fallback on `VALID_ACCENTS` index access in `cycleAccent`.

**Decisions:**
- Used `??` with safe default values rather than non-null assertions (`!`) to satisfy the compiler while keeping runtime behavior safe.
- `webkitBackdropFilter` cast uses `as unknown as Record<string, string>` since TypeScript's `CSSStyleDeclaration` doesn't include vendor-prefixed properties.

---

## 2026-03-14 — Fix double cursor, transition smoothness, and default cursor mode

**Branch:** `fix-double-cursor-bug`

**Summary:** Fixed multiple custom cursor bugs: duplicate cursor containers appearing on sidebar hover (StrictMode/HMR orphans), hand pointer persisting when quickly moving from theme image to sidebar, and non-smooth transitions between cursor states. Also made invert cursor the default for new users and reduced circle size.

**What changed:**
- `src/components/CustomCursor.tsx` — Added `data-custom-cursor` attribute to cursor containers and orphan cleanup at effect start (prevents StrictMode double-invoke creating duplicate cursors). Fixed hand pointer persistence on sidebar enter by hiding hand/arrow/comingSoon in sidebar-enter branch. Switched content elements (arrow, hand, comingSoon) from opacity-based to scale-based transitions (`transform: scale(0/1)` instead of `opacity: 0/1`) so state changes morph from center point rather than dissolve-crossfade. Removed rejected `morphViaCircle` two-phase approach. Reduced circle size from 80px to 64px and morph leave delay from 200ms to 150ms. Reverted `injectCursorNoneStyle` to remove inline style on `<html>` that was causing cursor:none regression.
- `src/contexts/CursorContext.tsx` — Changed default cursor mode from `'standard'` to `'invert'` for new users (persisted preference still honored).
- `src/components/SidebarThemeControls.tsx` — Reordered cursor options: invert first, then standard, then figpal.

**Decisions:**
- **Scale-based content transitions** — Using `transform: scale(0/1)` instead of `opacity: 0/1` makes cursor state changes feel like shape morphs rather than dissolve crossfades. All content elements share the same center point, so hiding one while showing another creates a connected visual transition.
- **Rejected morphViaCircle** — A two-phase grow-then-shrink approach was tried but created an unintended flash (circle grows to full size as bridge, then shrinks to target). Direct state-to-state transitions are better.
- **64px circle** — Reduced from 80px for a more refined feel.
- **150ms leave delay** — Slightly faster than 200ms; responsive without gap-crossing flicker.

---

## 2026-03-13 — De-jargon Mochi case studies for external readability

**Branch:** `review-case-studies`

**Summary:** Systematic review of all 8 case studies for jargon, unclear concepts, and missing context. The Mochi subscriptions and progress tracker studies had the most issues — telehealth domain terms (health checks, refills, provider denials, cycles) assumed internal knowledge that an external reader (recruiter, hiring manager) wouldn't have. Other case studies (Sony, Duolingo, UW, Acorn, CIP) were clean.

**What changed:**
- `mochi-subscriptions.md` — Added one-sentence telehealth context up front ("Every order requires a doctor to review..."). Replaced jargon: "health checks" → describe actual data (weight and side effects), "provider" → "doctor", "refill" → "order", "Stripe scheduling costs" → "Stripe subscription automation fees". Fixed timing description to clarify order creation vs. pharmacy send. Quick version phrasing aligned with body.
- `mochi-progress-tracker.md` — Rewrote the data flow section to explain what actually happened instead of using system names ("stored on the order record" instead of "health checks stored on refills"). Replaced "provider" → "doctor", "every cycle" → "every month", "clinical workflow" → "ordering workflow". Title changed from generic ("Empowering weight loss...") to specific ("Turning an unused tracker into clinical infrastructure").

**Decisions:**
- Principle: use plain language for domain concepts (what patients do, what doctors decide) but keep slightly technical register for architecture (where data lives, how systems connect). This signals systems understanding without requiring a glossary.
- Each Mochi study should work standalone — removed cross-references that assumed the reader had read the other study.

---

## 2026-03-13 — Custom cursor "coming soon" state for non-link project cards

**Branch:** `custom-cursor-coming-soon`

**Summary:** Moved the "(coming soon)" signal from inline card title text to a new invert cursor morph state. When hovering a non-link project card in invert mode, the disc scales to 0 and "coming soon" text fades in — same morph pattern as the arrow on link cards.

**What changed:**
- `src/data/projects.ts` — Removed "(coming soon)" suffix from three side-project titles. Cards still distinguished by lighter `--text-medium` color, no underline, and trailing ellipsis.
- `src/components/CustomCursor.tsx` — Added `comingSoonRef` element (22px Literata 300, accent-tinted, `mix-blend-mode: difference`). Introduced `cursorContentRef` to track three morph states (`idle` / `arrow` / `coming-soon`) replacing the boolean `showArrow` check. Morph effect now handles non-link cards: disc→scale(0), "coming soon"→opacity 1. Tint observer updates coming-soon text color on accent/theme changes.
- `core-docs/design-language.md` — Added "coming soon" as priority 2 in the invert mode morphing hierarchy (between arrow and hand).

**Decisions:**
- **Literata 300 at 22px** — Matches the section narrative text style (same font, weight, and size). Chosen over Onest (cursor arrow font) after comparing both via dev panel. The serif at light weight creates visual distinction from the Onest arrow while staying cohesive with the page's editorial voice.
- **Text-only morph (no pill/background)** — Follows the existing arrow pattern: disc scales to 0, text floats with `mix-blend-mode: difference`. Simpler than a filled pill and avoids contrast issues across light/dark modes.
- **Dev panel stripped before merge** — Font/size/weight comparison panel (`ComingSoonDevPanel.tsx`) used during development, removed per dev panels policy.

---

## 2026-03-13 — Fix glass hover persistence and cursor morph flicker

**Branch:** `fix-hover-and-heatmap`

**Summary:** Fixed two related hover issues: (1) the glass highlight pill persisted when the cursor moved horizontally off a project card, and (2) the custom cursor arrow flickered back to a circle when moving between vertically adjacent cards.

**What changed:**
- `src/hooks/useGlassHighlight.ts` — `isCursorInCardStack` now checks horizontal bounds against the *current card's* width instead of the union of all cards. Previously, the widest card in the stack extended the hover zone of every card, keeping the glass visible when the cursor was far to the right of shorter cards.
- `src/components/ProjectLink.tsx` — Changed card layout from `width: fit-content` to `width: max-content` with `align-self: flex-start` so card elements hug their text content.
- `src/components/CustomCursor.tsx` — Extracted cursor morph leave delay to `MORPH_LEAVE_DELAY` constant (200ms). This debounce prevents the arrow→circle flicker when crossing gaps between cards.
- `src/components/ContributionHeatmap.tsx` — Increased heatmap contrast between 0 and 1+ contributions (adjusted `BASE_SAT` and `BASE_ALPHA`). Added `hoveredCell` state with highlight overlay for standard/figpal cursor modes. Tooltip now shows for nearest cell even in gaps via SVG coordinate math.
- `core-docs/design-language.md` — Updated card stack boundary docs (horizontal bounds use current card, not union), link card layout (max-content), cursor morph debounce.

**Decisions:**
- Glass `clearDelay` stays at 150ms (glass handles gaps fine via its own lerp animation — no change needed).
- Cursor morph delay set to 200ms after testing 200ms vs 250ms. 200ms felt snappier and more honest — the cursor reflects reality faster while still preventing most gap-crossing flicker.
- Horizontal bounds use the current card's width rather than any-card-contains-point, preventing wide cards from extending the hover zone of unrelated narrower cards.

---

## 2026-03-11 — Fix hover preview image scaling and summary text layout

**Branch:** `fix-hover-preview-scale`

**Summary:** Hover preview images were too large in the right column, and summary description text had layout issues (jerk on crossfade, too narrow, misaligned). Fixed image constraints so previews of any aspect ratio fill available space without overlapping the text zone, while theme portrait images remain completely unaffected.

**What changed:**
- `src/components/ImageDisplay.tsx` — Preview images now constrained to `maxWidth: 90%` and `maxHeight: calc(100% - 144px)` (reserving TEXT_ZONE_HEIGHT + 24px gap from the spacing hierarchy). Theme portraits remain at 100%/100%. Summary text `<motion.p>` elements made absolutely positioned within the text zone to prevent crossfade layout jerk (during AnimatePresence sync mode, stacked elements no longer push each other). Summary text centered via `left: 0; right: 0; margin: 0 auto` instead of `left: 50%; translateX(-50%)` (the latter limited available width to half the container). Text maxWidth increased from 480px to 540px (~65 chars/line at 15px Literata). Removed 0.15s delay on text fade so image and text animate simultaneously. Lottie container padding updated to reserve same text zone space.

**Decisions:**
- **24px gap** between image area and text zone — from the spacing hierarchy (80/64/56/40/32/24/8), matching element-to-element spacing tier.
- **90% maxWidth** for previews — generous enough for landscape images (Sony GIF) to fill width, with minimal breathing room at edges.
- **`calc(100% - 144px)` maxHeight** for previews — reserves 120px text zone + 24px gap. Tall images (phone mockups) constrained by height; wide images constrained by width + natural aspect ratio. Each preview fills as much space as it can.
- **540px text maxWidth** — yields ~65 chars/line at 15px Literata (serif at that size averages ~7.5px/char). Previous 480px gave ~42 chars, too narrow.
- **Absolute positioning on summary `<motion.p>`** — prevents the crossfade jerk where entering text appeared below exiting text, then jumped up when the exiting element was removed from DOM.
- **No text delay** — the 0.15s delay was previously removed (March 7 fix) but had been re-added; removed again for simultaneous image+text fade.

---

## 2026-03-11 — Fix stale contribution heatmap data

**Branch:** `fix-heatmap-recent-days`

**Summary:** March 9–10 showed 0 contributions in the heatmap. Root cause: the `GH_CONTRIBUTIONS_TOKEN` repo secret was never created, so the GitHub Actions daily sync workflow never ran. The `contributions.json` was last fetched on March 9 during feature development and became stale immediately.

**What changed:**
- `src/data/contributions.json` — Refreshed via local fetch. Now contains data through March 11.
- `.github/workflows/update-contributions.yml` — Changed cron from `0 6 * * *` (6 AM UTC) to `0 8 * * *` (midnight PST / 1 AM PDT) to capture the full previous day's contributions.

**Findings:**
- The `.github/workflows/update-contributions.yml` was only merged to `main` on March 11 (via PR #45). GitHub only runs scheduled workflows from the default branch, so it could not have run before then.
- Even after merge, the workflow had 0 runs because `GH_CONTRIBUTIONS_TOKEN` repo secret was not configured.
- The fetch script and component code are correct — the only issue was the missing secret preventing automated data refresh.

**Resolution:**
- Added `GH_CONTRIBUTIONS_TOKEN` classic PAT (`read:user` scope) as a repo secret.
- Triggered manual workflow run — confirmed all steps pass (fetch, commit, push).
- Updated cron schedule to midnight PST for cleaner daily boundary.

---

## 2026-03-11 — Restructure case study layout to three-zone format

**Branch:** `concise-case-studies`

**Summary:** Replaced the paginated 100vh-per-section layout with a three-zone structure: hero (100vh) → flowing body text (centered 720px column) → visual evidence grid (2-column, 960px). Optimized for scannability — the reader gets hook, argument, and evidence in a single scroll rather than clicking through viewports.

**What changed:**
- `src/components/CaseStudyLayoutA.tsx` — Core restructure: removed per-section 100vh rows and visual carry-forward logic. Body text now flows in a centered column. Section visuals + gallery items collected into a 2-column CSS grid below the text. Updated both wide and narrow paths.
- `src/components/CaseStudySectionText.tsx` — Heading size bumped from 24px to 28px for better visual hierarchy in flowing context.
- `core-docs/design-language.md` — Rewrote case study page structure section to document the three-zone layout.

**Decisions:**
- Body text column at 720px for optimal line length at 18px. Visual grid wider at 960px to give visuals breathing room.
- heroVisual excluded from the evidence grid (already in the hero zone).
- Odd last visual spans both grid columns. 0 visuals = grid skipped entirely.
- Narrow layout: sections flow without inline visuals; all visuals stack below text in a single column.

---

## 2026-03-11 — Condense all case studies to 30-second reads

**Branch:** `concise-case-studies`

**Summary:** Condensed all case studies to match the concise format of Acorn/UW (declarative headings, 1-2 sentences per section). Shift in portfolio philosophy: embrace "show, don't tell" — earn an interview in 30 seconds, not tell the whole story.

**What changed:**
- `src/data/case-study-content.ts` — Rewrote 5 case studies:
  - **Mochi Subscriptions**: 5 sections/12 paragraphs → 4 sections/4 paragraphs. Cut resolution section, condensed each section to core insight + impact.
  - **Mochi Progress Tracker**: 4 sections/7 paragraphs → 3 sections/3 paragraphs. Merged data unification + resolution into one section.
  - **Sony Screenless TV**: 4 sections/6 paragraphs → 3 sections/3 paragraphs. Cut testing section.
  - **CIP Election Misinformation**: Rewrote from academic abstract format to portfolio voice. 2 sections focused on contribution + outcome.
  - **Duolingo**: Trimmed "known problem" section and tightened closing.
- `src/components/CaseStudyLayoutA.tsx` — Layout adjustments: hero title/subtitle shifted from center-aligned to left-aligned, removed sticky positioning from section visuals, added flex vertical centering to both text and visual columns in narrative sections.
- `core-docs/guidelines.md` — Updated case study philosophy to reflect concise format (30-second scan, 2-4 short sections, show-don't-tell).
- `core-docs/design-language.md` — Updated case study page structure to reflect layout changes (left-aligned hero, no sticky visuals, flex-centered columns).

**Preserved as historical record (no changes):**
- All 8 files in `src/data/case-studies/*.md` — original long-form content kept for reference.

**Decisions:**
- Acorn and UW were already at target length — left unchanged.
- Mochi AI Tooling left as placeholder — no source content to condense.
- `projects.ts` summary fields already aligned with subtitles — no changes needed.
- Gallery items kept on Mochi Subscriptions — visuals do the showing.

---

## 2026-03-10 — Add GitHub contribution heatmap

**Branch:** `github-contribution-heatmap`

**Summary:** Added an SVG contribution heatmap to the portfolio's left column, showing a full-year grid of GitHub activity. Includes a data pipeline (fetch script + GitHub Actions) and a glass-break interaction pattern to prevent the glass pill from interfering with the visualization.

**What changed:**
- `src/components/ContributionHeatmap.tsx` — New component rendering a year-grid SVG heatmap with accent-hued cells, hover tooltips, keyboard navigation (arrow keys), and screen reader support (aria-live announcements).
- `src/components/Section.tsx` — Added `afterContext` prop to inject content between a section's description and its project links.
- `src/components/LeftColumn.tsx` — Passes `ContributionHeatmap` as `afterContext` to the last section.
- `src/hooks/useGlassHighlight.ts` — Added `data-glass-break` escape hatch: when cursor enters a `[data-glass-break]` element inside a glass container, the pill immediately clears.
- `src/styles/theme.css` — Added `--contrib-0` through `--contrib-4` CSS custom properties for heatmap cell colors.
- `src/data/contributions.json` — Static contribution data (383 contributions, ~53 weeks).
- `scripts/fetch-contributions.ts` — Node.js script using GitHub GraphQL API to fetch contribution data.
- `.github/workflows/update-contributions.yml` — GitHub Actions workflow running the fetch script daily at 6am UTC.
- `package.json` — Added `tsx` dev dependency and `fetch-contributions` npm script.

**Decisions:**
- Used `date >= today` (not `>`) for the "future" tooltip check because data is fetched once daily, so today's count may be stale — showing "No contributions (yet)" avoids displaying a misleading zero.
- Cell colors are computed inline via `contribFill()` rather than using the `--contrib-*` CSS properties, because fills depend on both level and `bgIntensity` at render time.
- Keyboard navigation uses a single focusable wrapper with arrow keys (slider pattern from `SidebarThemeControls.tsx`) rather than 365 individual `tabIndex` stops on each cell.

---

## 2026-03-09 — Theme-tinted inverse cursor

**Branch:** `cursor-theme-tint`

**Summary:** The invert cursor disc was pure white — now it carries a theme-specific tint derived from `--accent-hue`, making the cursor feel cohesive with the active accent color.

**What changed:**
- `src/components/CustomCursor.tsx` — Disc background, arrow color, and hand SVG fill all use `getTintColor(hue, bold, isDarkMode())` instead of `'white'`. Two intensity levels: bold (`hsl(hue, 72%, 78%)`) and subtle (`hsl(hue, 45%, 88%)`). In light mode, hue is shifted by 180° so `difference` blending against light backgrounds produces accent-adjacent (not complementary) colors. MutationObserver extended to watch both `data-accent` and `data-theme` for live updates on accent or mode switch.
- `src/contexts/CursorContext.tsx` — Added `CursorTintMode` (`'tint-bold' | 'tint-subtle'`), persisted to `localStorage` key `cursorTintMode`, default `'tint-bold'`.
- `core-docs/design-language.md` — Documented theme tinting formula, mode-aware hue correction, and both intensity levels in the Cursor System section.

**Decisions:**
- Chose tinted-disc approach over alternatives (two-layer overlay, CSS hue-rotate filter) after comparing all three. Tinted disc is the most direct — it changes the disc color itself, producing predictable results across all backgrounds and staying coherent with the glass highlight system's tint logic.
- 180° hue shift in light mode is a clean solution to the `difference` blend math: `|light_bg - complement_color|` ≈ accent-adjacent result.
- Bold default because the tint should be clearly visible, not a barely-perceptible hint. Subtle exists as a user option via localStorage.

---

## 2026-03-08 — Fix design language audit findings (8 items)

**Branch:** `update-design-language-doc`

**Summary:** Systematic audit of the codebase against `design-language.md` found 8 inconsistencies. All fixed in one pass.

**Fixes:**
1. **Manrope → Onest** in `CaseStudyPage.tsx` (error fallback) and `CustomCursor.tsx` (arrow element). Manrope was the old font; the two-voice system uses Literata + Onest.
2. **Image cross-fade 400ms → 300ms** in `ImageDisplay.tsx`. Spec says 300ms for hover transitions.
3. **Case study header fade 400ms → 350ms** in `CaseStudyLayoutA.tsx`. Spec says 350ms for content reveals.
4. **Portrait color values fixed in design-language.md** — bg was `hsl(47,18%,10%)`/`hsl(42,22%,91%)`, corrected to `hsl(41,14%,10%)`/`hsl(39,15%,92%)`. Swatch was `hsl(47,34%,64%)`, corrected to `hsl(43,22%,62%)`. Now matches `tokens.md` and `theme.css`.
5. **Added onFocus/onBlur to back links** in `CaseStudyPage.tsx` (both error fallback and main nav). Keyboard users now get cursor arrow morph on focus.
6. **Resolved SUMMARY_FONT dev toggle** in `ImageDisplay.tsx`. Committed to serif (Literata 300/15px), removed the toggle and dual-style object.
7. **Trimmed Google Fonts weights** in `index.html`. Was loading 300-700 for both fonts; now loads only Literata 300 and Onest 400 (the only weights used).
8. **Centralized swatch colors** in `SidebarThemeControls.tsx`. Replaced hardcoded HSL strings with reads from `--swatch-{color}` CSS custom properties, eliminating token duplication.

---

## 2026-03-08 — Synthesize design patterns into design-language.md

**Branch:** `update-design-language-doc`

**Summary:** Comprehensive update to `core-docs/design-language.md` to document patterns that had been implemented but not codified. The document now covers the full scope of the site's design system, enabling Claude to make better decisions when building new UI.

**What was added:**
- **Cursor System** (new section): Three cursor modes (standard/invert/figpal), invert mode morphing priority hierarchy (arrow > hand > sidebar shrink > disc), braille micro-animation on navigation, figpal trailing physics, global cursor suppression, reduced motion handling.
- **Iconography & Symbols** (new section): Phosphor Icons system with sizing rules, Unicode symbol vocabulary (→←…⠀–⣿), arrow-as-interaction-signal principle, anti-patterns for icon usage.
- **Page Transitions & Navigation** (new section): View Transitions API usage, navigation choreography timelines for both cursor modes, exit/entry animations, case study page structure (layout, edge fades, sticky visuals, gallery grid).
- **Click-to-cycle accent** (new subsection under Imagery): Spring press animation, accent-cycled event, sidebar jiggle cross-reference.
- **Summary text below image** (new subsection under Imagery): Font options, delayed fade timing, fixed text zone for layout stability.
- **Cursor mode picker** (added to Interactive Controls): Three modes in sidebar toolbar.
- **Sidebar jiggle** (added to Interactive Controls): Horizontal nudge animation on accent cycle.
- **Vineyard theme** added throughout: 5th accent color with background, swatch, and portrait image values.
- **Timing hierarchy expanded**: From 4 tiers to 10, including braille frames (50ms), exit/entry fades (280/350ms), spring press (400ms), and intermediate durations.
- **Easing assignments table**: Maps each curve to its specific use case and physical metaphor.
- **Radius scale expanded**: Added 12px (sidebar pill) and 4px (intensity strip).
- **Anti-patterns expanded**: Added rules for icons, cursor changes, page transitions, and mobile hover simulation.
- **Coherence checklist restructured**: Organized by category (typography, layout, motion, craft) with new checks for cursor morphing, reduced motion, data attributes, and Phosphor Icons.
- Updated "What motion does NOT do" to nuance the overshoot anti-pattern (Spring easing is intentional for direct press actions).

**Decisions:**
- Documented the Spring easing exception explicitly — the site avoids ambient bouncy overshoots but intentionally uses Spring for direct user-initiated press feedback. This resolves the apparent contradiction.
- Structured new sections to match existing document conventions (philosophy statement → specification tables → anti-patterns).
- Kept case study layout documentation at a structural level (not pixel-level) since that layout is still evolving.

---

## 2026-03-08 — Add hand cursor on theme image hover

**Branch:** `cursor-hand-on-image`

**Summary:** Hovering the right-column theme image now morphs the invert cursor from the white disc to a Phosphor hand-pointing icon (white, 48×48). The cursor arrow also flips to a left arrow (`←`) when hovering back links on case study pages.

**What changed:**
- `src/components/CustomCursor.tsx` — Added `HAND_SVG` constant (Phosphor fill hand-pointing). Created a new `hand` DOM element (opacity-faded, layered below the circle). On `pointermove`, detects `[data-theme-image]` elements: circle scales to 0 and hand fades in; leaving restores circle or hand based on context. Arrow direction now reads `onBackLinkRef` to show `←` on `[data-back-link]` elements. All new transitions (arrow opacity, hand opacity, circle scale) are gated on `reducedMotion.current` per accessibility standards.
- `src/components/ImageDisplay.tsx` — Added `data-theme-image` attribute to the outermost container for cursor hit-detection.
- `src/components/CaseStudyPage.tsx` — Added `onMouseEnter`/`onMouseLeave` handlers on both back links to set `hoveringLink`, enabling the cursor arrow direction flip.

**Decisions:**
- Hand cursor uses the same `mix-blend-mode: difference` container as the circle/arrow, so it inverts naturally over light/dark backgrounds.
- Arrow takes priority over hand: when hovering a card over the image, the hand hides and arrow shows. On card leave, hand restores if still over the image.
- All new CSS transitions gated on `reducedMotion.current` — falls back to `'none'` (instant) when `prefers-reduced-motion: reduce` is active.

---

## 2026-03-08 — Page transitions, hero image anchor, and case study hero centering

**Branch:** `cambridge`

**Summary:** Implemented smooth page transitions between homepage and case study pages using the View Transitions API for hero image morphing, framer-motion for content fade animations, and centered the case study hero section (title + image).

**What changed:**

- `src/components/ProjectLink.tsx` — Arrow slide-out animation (500ms) on click before navigation. Wraps navigation in `document.startViewTransition()` + `flushSync` + `scrollTo(0, 0)` for seamless hero image morph. Sets `navigatingProjectId` in HoverContext to trigger homepage content exit fade.
- `src/components/ImageDisplay.tsx` — Added `viewTransitionName: 'project-hero'` on project preview images (conditional: only when a project is hovered and not showing Lottie). Changed text zone height from always-120px to `summary ? 120 : 0` so default portrait gets full image area.
- `src/components/LeftColumn.tsx` — Wrapped content in `motion.div` with entrance/exit fade driven by `navigatingProjectId`. Exit fade (280ms, 150ms delay) aligns with arrow animation timing. Entrance fade (350ms, 120ms delay) plays when returning from case study.
- `src/components/CaseStudyPage.tsx` — Added `isExiting` state and `motion.div` wrapper for full-page fade-out (280ms) on back navigation before View Transition fires. Nav changed from `sticky` to `fixed` to remove it from document flow (eliminates 64px vertical offset that broke image anchor). `scrollTo(0, 0)` inside `startViewTransition` callback ensures correct capture position.
- `src/components/CaseStudyLayoutA.tsx` — Added `previewImage` and `summary` props. Hero image with `viewTransitionName: 'project-hero'` for anchor morph. Entrance fade on `motion.header` (400ms, 150ms delay). Wide layout: centered title/subtitle (`textAlign: 'center'`, `alignItems: 'center'`). Left column mirrors right column's `flex: 1` + text zone reservation structure so title and image share the same vertical center.
- `src/contexts/HoverContext.tsx` — Added `navigatingProjectId` state (readable by LeftColumn for exit fade, set by ProjectLink on click).
- `src/data/projects.ts` — Added `getProjectForSlug()` helper to look up full Project object from case study slug.
- `src/styles/globals.css` — Added View Transition CSS: root crossfade (250ms), `project-hero` morph (300ms, cubic-bezier easing), reduced-motion overrides.
- `src/components/CustomCursor.tsx` — Extended braille unicode animation for cursor invert mode.
- `src/vite-env.d.ts` — Added `startViewTransition` type declaration for View Transitions API.

**Key decisions:**
- **View Transitions for image only, framer-motion for text**: `view-transition-name: page-content` on text containers didn't produce visible animations despite correct CSS. Switched to framer-motion for all text fade animations. Image morph via View Transitions API works reliably.
- **Full-page fade on back navigation**: User preferred ALL case study content fading out together (single `motion.div` wrapper) rather than text fading separately from images.
- **Nav fixed instead of sticky**: Removes nav from document flow so hero section starts at viewport top, matching homepage RightColumn's `position: fixed; top: 0`. Functionally identical (was sticky at top: 0).
- **Text zone reservation on left column**: The right column's 120px text zone (for summary text) offsets the image center upward. Adding the same reservation to the left column ensures title and image share the same vertical center. Height is conditional (`summary ? 120 : 0`), matching all 8 case studies correctly.
- **Padding matches homepage**: Both hero columns keep `padding: var(--layout-padding-top) var(--layout-margin)` to match the homepage RightColumn exactly, preserving the view transition anchor position.

---

## 2026-03-07 — Add accent cycle on image click + sidebar jiggle

**Branch:** `image-click-delight`

**Summary:** Clicking the right-column portrait now cycles the accent color with a spring press animation. When the accent cycles via image click, the sidebar trigger dot jiggles to encourage discovery of the full theme controls. Explored multiple approaches (CSS ring ripple, canvas-based water ripple with 5 render styles) before settling on the simpler cycle + spring press — aligned with the "skeleton is permanent; skin is variable" design principle.

**What changed:**
- `src/components/ImageDisplay.tsx` — Added click/keyboard handlers that call `cycleAccent()`, play a CSS spring press (`scale(0.985)` → `scale(1)` with overshoot bezier), and dispatch a custom `accent-cycled` DOM event. Added `cursor: pointer`, `tabIndex={0}`, `role="button"`, `aria-label`. Separated `aria-live="polite"` into a dedicated visually-hidden element to avoid conflicting ARIA semantics (live regions must not be interactive). Also added Lottie preview support and a fixed-height text zone for project summaries (crossfade layout).
- `src/components/SidebarThemeControls.tsx` — Added `useEffect` listener for the `accent-cycled` custom event that applies/removes a `sidebar-jiggle` CSS class on the trigger dot ref.
- `src/contexts/ThemeContext.tsx` — Exported `VALID_ACCENTS`. Added `cycleAccent()` to context value (functional state update, persists to localStorage).
- `src/styles/globals.css` — Added `@keyframes sidebar-jiggle` (horizontal nudge, 400ms) and `.sidebar-jiggle` class. Existing `prefers-reduced-motion` rule covers the jiggle automatically.
- `src/components/RightColumn.tsx` — Simplified (no props, no toggle state).

**Deleted (dev-only exploration code):**
- `src/components/DevVariantToggle.tsx` — Dev toggle for switching between ripple/cycle variants and ripple sub-styles.
- `src/hooks/useWaterRipple.ts` — Canvas-based two-buffer wave propagation hook with 5 render styles (pure, refraction, chromatic, tint, blur).

**Decisions:**
- Cycle + spring press chosen over water ripple — the ripple was technically impressive but felt heavy for a portfolio. The cycle is more aligned with the site's theme of subtle discovery.
- Custom DOM event (`accent-cycled`) used for cross-component communication to avoid polluting React context with transient UI state. Jiggle only fires on image-click, not sidebar swatch clicks.
- Spring press uses CSS-only approach (not Framer Motion) to avoid mixing animation systems per earlier feedback.

---

## 2026-03-07 — Remove top-of-funnel case study, keep AI tooling as separate project

**Branch:** `remove-funnel-case-study`

**Summary:** Removed the "Building a competitive top of funnel experience" project link and its association with the `mochi-ai-tooling` case study. Re-added AI tooling as its own distinct project (stub, content TBD) — third in the Mochi section, after tracker and subscriptions.

**What changed:**
- `src/data/projects.ts` — Removed `mochi-funnel` project entry. Added `mochi-ai-tooling` as a separate project with its own case study slug.
- `src/data/case-study-content.ts` — `mochiAiTooling` case study retained as a stub (empty sections/gallery, "Content coming soon.").
- `src/data/case-studies/mochi-ai-tooling.md` — Recreated as stub markdown.
- `core-docs/plan.md` — Updated Mochi section project list to reflect the change.

**Decisions:**
- Top-of-funnel and AI tooling are separate projects — the old entry conflated them by linking the funnel title to the AI tooling case study.
- AI tooling kept as a live link to a stub page rather than a "coming soon" non-link, since content will be added soon.

---

## 2026-03-07 — Fix sidebar hover pill timing with stagger animations

**Branch:** `fix-sidebar-hover-timing`

**Summary:** Fixed a UX gap where the sidebar hover pill wouldn't appear if the user's cursor was stationary over a control that was mid-stagger-animation, or if the cursor moved to a control before its opacity animation completed.

**What changed:**
- `src/components/SidebarThemeControls.tsx` — Extracted pill-positioning logic from `handleMouseOver` into `showPillForControl` to enable reuse from multiple code paths.
- Added `isControlVisible(control)` — checks if a control's parent `motion.div` wrapper has reached opacity >= 0.95 (i.e., stagger animation complete).
- Added `retryUntilVisible(control)` — rAF loop that polls until a hovered control becomes visible, then shows the pill. Handles the case where the user mouses over a control before its stagger animation finishes.
- Added `probeStaticCursor()` — one-shot 800ms timeout that uses `document.elementFromPoint` to detect if a stationary cursor is over a control that animated in underneath it. `mouseover` doesn't re-fire when elements animate under a stationary pointer.
- Added `trackMouse` listener to cache cursor position for the static-cursor probe.
- Updated `handleMouseLeave` to cancel pending retries via `cancelRetry()`.
- All new resources (rAF, setTimeout, mousemove listener) properly cleaned up in teardown.

**Decisions:**
- Used `requestAnimationFrame` polling (not `setTimeout`) for the retry loop to stay in sync with the browser's render cycle and Framer Motion's opacity animation.
- 800ms probe delay chosen to exceed the maximum stagger animation completion time (~780ms = 14 items × 0.04s delay + 0.22s duration).
- Opacity threshold of 0.95 (not 1.0) to account for floating-point precision in computed styles.

---

## 2026-03-07 — Add portfolio guidelines doc

**Branch:** `add-portfolio-guidelines`

**Summary:** Created `core-docs/guidelines.md` — a strategic lens for content, copy, layout, and interaction decisions. Consolidated positioning, voice, visual philosophy, case study approach, and AI decision filters into a single doc. Updated CLAUDE.md to reference it and removed redundant "Design Philosophy" section.

**What changed:**
- Created `core-docs/guidelines.md` with: throughline ("finds the structural problem beneath the presented problem, then designs the simplest system that resolves it"), four principles (reframe first, systems over surfaces, design/engineering boundary is artificial, audience screening for autonomy), per-project reframe reference table, voice guidelines, case study philosophy, and AI decision filters.
- Grounded the throughline in Ben's sociology background (International Studies + Sociology at Middlebury) — structural thinking as worldview, not design technique.
- `CLAUDE.md` — Removed "Design Philosophy" section (subsumed by guidelines.md). Trimmed "About Ben" to factual context with pointer to guidelines.md. Added guidelines.md to core docs table and rules (consulted before any content/copy/design decision). Updated project structure tree.

**Decisions:**
- Guidelines.md operates at a higher altitude than design-language.md: guidelines = why (positioning, voice, editorial judgment), design-language = how (CSS values, glass recipes, timing tiers), tokens.md = what (HSL numbers).
- Project reframes table serves dual purpose: evidence for the throughline and a cheat sheet for case study writing.
- Case study philosophy updated: first bullet changed from "the actual problem" to "the reframe" to connect explicitly to the throughline.

---

## 2026-03-07 — Fix image resize on hover and sticky card hover

**Branch:** `fix-image-resize-on-hover`

**Summary:** Fixed two issues: (1) right-column images abruptly resizing when hovering between theme portraits and project previews with summary text, and (2) project cards staying hovered when the cursor moved horizontally off the card but stayed at the same Y position.

**What changed:**
- `src/components/ImageDisplay.tsx` — Restructured so each crossfade state (portrait or project preview) is a **single unit** containing both an image area (`flex: 1`) and a fixed-height text zone (`120px`, always allocated). Previously the image and summary were separate AnimatePresence groups — the image filled the full container and the summary was absolutely positioned at the bottom, causing visual size shifts during transitions. Now every unit has identical layout structure, so the image area never changes size regardless of whether summary text is present.
- `src/components/ImageDisplay.tsx` — Removed `delay: 0.15` from summary text transition so image and text fade in/out simultaneously instead of the text lagging behind.
- `src/components/ProjectLink.tsx` — Added `alignSelf: 'flex-start'` to both link and non-link card styles. Cards in a flex column with default `align-items: stretch` were stretching to the full container width despite having `width: fit-content`, causing `onMouseLeave` to only fire when leaving the entire LeftColumn rather than the card's visible bounds.

**Decisions:**
- `TEXT_ZONE_HEIGHT = 120` accommodates ~5 lines of summary text at 15px/1.5 line-height. Always allocated even when empty (portrait state) to keep the image area stable.
- Summary text has its own inner AnimatePresence within the text zone, keyed by `project.id`, to handle cases where two projects share the same `projectId` but have different summaries.

---

## 2026-03-07 — Fix meta theme-color, reorder swatches, set default intensity

**Branch:** `test-main-localhost`

**Summary:** Fixed the browser chrome theme-color meta tag not updating on theme switch, reordered accent swatches into a visually cohesive warm→cool sequence, and changed the default background intensity from 0 to 20% for first-time visitors.

**What changed:**
- `src/contexts/ThemeContext.tsx` — Replaced fragile RAF + getComputedStyle + remove/recreate meta tag approach with direct `computeBg()` calculation and `setAttribute`. Changed default `bgIntensity` from 0 to 0.2.
- `src/components/SidebarThemeControls.tsx` — Reordered accent swatches from arbitrary order to: table (34°) → portrait (43°) → pizza (15°) → vineyard (90°) → sky (204°). Warm cluster first, then cool fade, with table (default) leading.

**Key decisions:**
- **Direct computation over DOM read**: The old meta tag update read `--bg` from `getComputedStyle` inside a `requestAnimationFrame`, which was fragile and timing-dependent. Computing the value directly from state via `computeBg()` is simpler and reliable.
- **setAttribute over remove/recreate**: No need to remove and recreate the meta element — `setAttribute('content', ...)` works in modern browsers.
- **Swatch order**: Chose warm-cluster → cool-fade (table → portrait → pizza → vineyard → sky) over strict hue order, keeping the default accent first while grouping the three warm tones together.
- **20% default intensity**: Gives first-time visitors a hint of color rather than a flat neutral, making the theming system more discoverable.

## 2026-03-05 — Glass hover: lean + tilt (replace clip-path pentagon)

**Branch:** `cursor-pull-glass-hover`

**Summary:** Replaced the clip-path pentagon deformation system with a simpler CSS transform approach: lean (3px translate toward cursor) + tilt (1.0° rotation for cross-axis feedback). The new system is GPU-composited, artifact-free, and ~120 lines shorter. Also applied subtle lean + tilt to contact links, the Mochi Health link, and the case study back button.

**What changed:**
- `src/hooks/useGlassHighlight.ts` — Major rewrite (~690 → ~530 lines). Deleted `generateDeformedPath()` (~145 lines), `KAPPA` constant, `applyClipPath()`, and all clip-path logic. Added lean + tilt math in the RAF loop using dead zone (0.7) + exponential pull curve. Updated `applyPillPosition()` to accept lean/tilt params. Made `skinPill()` border + inner glow unconditional (no longer gated on `maxPull > 0`).
- `src/components/AboutSection.tsx` — Changed `maxPull: 0` to `maxPull: 3` for subtle directional feedback on email/LinkedIn/resume links.
- `src/components/CaseStudyPage.tsx` — Changed `maxPull: 0` to `maxPull: 3` for subtle lean + tilt on the sticky back button.

**Key decisions:**
- **Lean + tilt over clip-path**: The pentagon clip-path system (V1-V10+) produced directional feedback but accumulated visual artifacts (corner flicker, ghost outlines, tip radius mismatches). CSS transforms are inherently clean — no path string generation, no vertex ordering, no sub-pixel rendering issues.
- **Tilt formula**: `(cnx * dirY * |dirY| + cny * dirX * |dirX|) * maxTilt * t` — uses `dirY * |dirY|` (preserving sign, squaring magnitude) to ensure symmetric rotation in all quadrants. Earlier attempts with skew and simpler rotation formulas produced asymmetric results.
- **No swell**: Scale-based swell was removed because its translate offset (to simulate non-center transform-origin) overwhelmed the tilt's edge displacement, causing asymmetry.
- **Sidebar unaffected**: `SidebarThemeControls.tsx` uses its own custom pill implementation, not `useGlassHighlight`, so it gets no lean/tilt by design.

## 2026-03-05 — Sidebar theme controls on all pages

**Branch:** `hover-theme-all-pages`

**Summary:** Moved `SidebarThemeControls` from `Layout.tsx` (home page only) up to `App.tsx` so the hover sidebar theme changer renders on all routes, including case study pages.

**What changed:**
- `src/App.tsx` — Added `SidebarThemeControls` import and render alongside `<Routes>`.
- `src/components/Layout.tsx` — Removed `SidebarThemeControls` import and render (no longer needed here since it's at the app level).

**Bugfix — localStorage validation crash:**
- `ThemeContext` initialized `accentColor` from localStorage with `(stored as AccentColor) || 'table'`, which only catches null/empty — not invalid strings. Stale localStorage values from other branches crashed `SidebarThemeControls` because `accents.find()` returned `undefined` and `activeSwatch.swatch` threw a TypeError, blanking the entire page.
- Fixed by adding `VALID_ACCENTS` and `VALID_MODES` arrays and validating with `.includes()` before using stored values. Also changed `accents.find(...)!` to `accents.find(...) ?? accents[0]` in SidebarThemeControls for defensive fallback.
- Applied the same validation to `CursorContext.tsx` with `VALID_CURSOR_MODES`.
- See `core-docs/feedback.md` for the full lesson on localStorage validation.

**Bugfix — sidebar pill position during animation:**
- `getControlPosition` in `SidebarThemeControls` used `getBoundingClientRect()`, which reflects CSS transforms applied by Framer Motion's slide-in animation (x: 20 → 0). This caused the pill to snap to the wrong position when a user hovered a control before the entrance animation completed.
- Fixed by replacing `getBoundingClientRect()` with an `offsetLeft`/`offsetTop` traversal loop up to the container, which reads layout position independent of CSS transforms.

**Bugfix — hover state persisting on case study pages:**
- `CaseStudyPage.tsx` now resets `hoveredProjectId` and `hoveringLink` on navigation, preventing stale hover state from the home page from affecting the sidebar on case study pages.

**Decisions:**
- Since `SidebarThemeControls` uses `position: fixed`, it doesn't depend on any parent layout — lifting it to `App.tsx` is the simplest approach with no side effects.

## 2026-03-05 — New vineyard theme + sky image swap + portrait color tuning

**Branch:** `sky-theme-image`

**Summary:** Replaced the sky theme portrait with a vineyard photo (Napa wine country). Added a new "vineyard" accent theme (warm yellow-green, hsl 90°) derived from the photo's spring-green hills. Retuned the portrait accent from warm wheat (hsl 47, 34%) to a cooler taupe (hsl 43, 22%) that better complements the studio portrait's grey backdrop. Theme system now has 5 accents: table, portrait, sky, pizza, vineyard.

**What changed:**
- `public/images/portrait-sky.jpeg` — Restored to original sky image.
- `public/images/portrait-vineyard.jpeg` — New vineyard portrait (pre-cropped to portrait aspect ratio).
- `src/contexts/ThemeContext.tsx` — Added `vineyard` to AccentColor union and BG_BASE. Updated portrait BG values to cooler taupe (hsl 39/41°, 14-15% sat).
- `src/components/SidebarThemeControls.tsx` — Added vineyard swatch. Updated portrait swatch to `hsl(43, 22%, 62%)`.
- `src/data/projects.ts` — Added vineyard to defaultImageMap.
- `src/styles/theme.css` — Added vineyard light/dark CSS rules. Updated portrait swatch, bg, and accent-hue across light and dark modes. Added `--swatch-vineyard` root variable.
- `tokens.md` — Updated portrait values, added vineyard values, updated counts (5 themes, 19 tokens).

**Decisions:**
- Vineyard hue landed at 90° after iterating from 105° (too blue-green) → 82° (too chartreuse) → 90° (matches sunlit Napa hills).
- Portrait color tuned through 4 test variants (warm wheat, amber, cool taupe, neutral grey, plus blue slates). Final choice: `hsl(43, 22%, 62%)` — slightly cooler and less saturated than original, better match for the grey studio backdrop.
- Sky image restored to original; vineyard gets its own separate image file.

## 2026-03-04 — Arrow cursor on contact and Mochi Health links

**Branch:** `fix-link-cursor-arrow`

**Summary:** Extended the invert cursor arrow morph to fire on all glass-highlighted links — Mochi Health, email, LinkedIn, and resume — matching the behavior already present on project cards.

**What changed:**
- `src/contexts/HoverContext.tsx` — Added `hoveringLink` boolean + `setHoveringLink` setter alongside the existing `hoveredProjectId` state. Keeps project-specific hover (used for image swap) separate from generic link hover (cursor only).
- `src/components/CustomCursor.tsx` — Arrow morph condition expanded: `showArrow = (project?.isLink) || hoveringLink`. Added `hoveringLink` to the useEffect dependency array.
- `src/components/HeroTitle.tsx` — Mochi Health `<a>` now calls `setHoveringLink(true/false)` on mouse enter/leave and focus/blur.
- `src/components/AboutSection.tsx` — Email, LinkedIn, and resume `<a>` elements now call `setHoveringLink(true/false)` on mouse enter/leave and focus/blur.

**Decisions:**
- Used a separate `hoveringLink` boolean rather than funneling through `hoveredProjectId` — avoids triggering the image swap on the right column, which only responds to project IDs.
- Same morph animation (circle scale 0 → arrow fade in, 200ms debounced restore) applies identically to all links.

## 2026-03-04 — Custom cursor controls in sidebar

**Branch:** `muscat`

**Summary:** Added a 3-option cursor style selector to the sidebar theme controls, grouped below the appearance mode selector. Users can choose between a standard cursor, an 80px inverted-color circle (mix-blend-mode: difference), or a 72px figpal character trailing the cursor with spring inertia.

**What changed:**
- `src/contexts/CursorContext.tsx` — New context providing `cursorMode` ('standard' | 'invert' | 'figpal') with localStorage persistence. Follows the same pattern as ThemeContext.
- `src/components/CustomCursor.tsx` — New component that renders cursor effects via imperative DOM manipulation. Invert mode: hides the default cursor (`* { cursor: none !important }` injected globally), shows an 80px white circle with `mix-blend-mode: difference`. On linkable card hover (tied to `hoveredProjectId` from HoverContext, not `elementFromPoint`), the circle morphs into a `→` arrow via scale transition — the arrow sits beneath the circle, revealed as the disc scales to 0. Debounced arrow→circle transition (200ms) prevents flicker between cards. Over the sidebar, the circle shrinks to a 12px dot (scale 0.15) and the arrow stays hidden. Figpal mode keeps the standard cursor and renders the character trailing 24px right/below with RAF lerp inertia (rate 0.12). Respects `prefers-reduced-motion`.
- `src/components/SidebarThemeControls.tsx` — Extended with a new cursor radiogroup section: divider + 3 buttons (Cursor icon, Circle icon, figpal thumbnail). Own glass pill container. Stagger indices extended (DIVIDER_4, CURSOR_BASE). Added `data-sidebar` attribute on outermost container for cursor detection. Imported Cursor and Circle from Phosphor.
- `src/components/ImageDisplay.tsx` — Fixed hover preview summary text causing theme image to shrink: made summary text absolutely positioned so it overlays without affecting image sizing.
- `src/App.tsx` — Added CursorProvider and CustomCursor to the provider tree.
- `public/images/figpal.png` — Figpal character image for the trailing cursor and sidebar icon.

**Decisions:**
- Separate CursorContext rather than extending ThemeContext — keeps concerns modular.
- Single container with `mix-blend-mode: difference` for invert mode — arrow and circle are children. Avoids stacking context isolation issues from nesting blend modes.
- Arrow morph uses scale transition on circle (top layer) to reveal arrow text (bottom layer) — visually convincing disc-to-arrow morph.
- Card hover detection uses `hoveredProjectId` (React state) rather than `elementFromPoint` — ties cursor arrow to same state as glass pill, preventing flicker in gaps between cards.
- Figpal icon in sidebar uses a tiny `<img>` rather than a Phosphor icon since it's a custom character.

## 2026-02-24 — Project hover previews: Lottie, GIF, and static images (WIP)

**Branch:** `lottie-cip-hover`

**Summary:** Added project-specific hover previews to the right column — replacing the previous placeholder system where all projects shared one of 4 generic images. Previews now support multiple media formats (Lottie JSON, GIF, PNG) and preserve their native aspect ratios. Added mode-aware drop shadows for light-background previews. Work in progress — more project visuals still needed.

**What changed:**
- `src/components/ImageDisplay.tsx` — Rewrote to support three media types: static images, animated GIFs (via `<img>`), and Lottie JSON (via `lottie-react`, fetched on hover). Removed fixed `528×720` aspect ratio container — previews now use `object-fit: contain` centered in the right column. Added `drop-shadow` filter for specified projects, mode-aware (soft white glow in dark mode, subtle black shadow in light mode).
- `src/components/RightColumn.tsx` — Changed `justifyContent` to `center` for vertical centering of variable-aspect-ratio previews.
- `src/data/projects.ts` — Added optional `lottiePreview` field to `Project` interface. Set on `cip-misinfo` project. Gave `mochi-tracker` its own `projectId` to decouple it from the Sony gif. Updated image map: `sony` → `.gif`, `acorn` → `.png`, added `mochi-tracker` entry.
- `public/images/preview-cip.json` — Lottie animation for CSCW misinformation project (fan-in network visualization, plays once).
- `public/images/preview-sony.gif` — Animated GIF for Screenless TV project (loops).
- `public/images/preview-acorn.png` — Eat Local VT mobile app screenshot.
- `package.json` — Added `lottie-react` dependency.
- `core-docs/design-language.md` — Documented project preview media system, Lottie support, shadow specs, updated image rules.

**Key decisions:**
- **Per-project `lottiePreview` override** rather than changing the shared `projectImageMap` system. This keeps backward compatibility — most projects still use the `projectId` → image lookup, only specific projects opt into Lottie.
- **`object-fit: contain`** for previews instead of `cover` — each preview keeps its native aspect ratio rather than being cropped to a fixed frame.
- **Mode-aware `drop-shadow`** using CSS `filter` (follows pixel shape) rather than `box-shadow` (follows bounding box). White glow in dark mode, black shadow in light mode — both subtle enough to not look like a design element.
- **Lottie plays once** for CSCW; GIF loops natively for Sony. Loop behavior is per-media-type.
- **WIP**: More project visuals still need to be added (UW, Mochi projects, Duolingo).

**Files changed:** ImageDisplay.tsx, RightColumn.tsx, projects.ts, design-language.md, history.md, preview-cip.json, preview-sony.gif, preview-acorn.png, package.json

---

## 2026-02-23 — Glass hover on inline links (Mochi Health + contact links)

**Branch:** `home-page-refinements`

**Summary:** Extended the glass pill hover system to inline text links — "Mochi Health" in the hero title, and email/LinkedIn/resume contact links in the about section. Each link group has its own glass behavior tuned for inline context: tighter border radius (8px vs 16px), no pull/stretch deformation, and per-card tight bounds so the pill clears when the cursor leaves a link rather than staying alive across the full container.

**What changed:**
- `src/components/HeroTitle.tsx` — "Mochi Health" link uses `data-link-card` (participates in project card pill) with `data-tight-bounds` (clears when cursor leaves) and `data-border-radius="8"` (inline-sized pill). Inline-block with lineHeight 1 for tight pill sizing. Underline matches project card style (`--text-underline`).
- `src/components/AboutSection.tsx` — Refactored from `dangerouslySetInnerHTML` to JSX. Contact links (email, LinkedIn, resume) use `data-contact-card` inside a dedicated `useGlassHighlight` container with `cardSelector: '[data-contact-card]'`, `tightBounds: true`, `clearDelay: 300`, `borderRadius: 8`, no pull/stretch.
- `src/hooks/useGlassHighlight.ts` — New config options: `cardSelector` (customizable element selector, default `'[data-link-card]'`), `tightBounds` (container-level immediate clear), `clearDelay` (configurable clear timer, default 150ms). Per-card `data-tight-bounds` attribute for mixed containers. Per-card `data-border-radius` override. Nested container guard (`card.closest('[data-glass-highlight-active]') !== container`) prevents parent pill instances from responding to cards in nested containers. When leaving a tight-bounds card toward the card stack, uses a longer delay (400ms) so the cursor can reach the next card.
- `src/components/SidebarThemeControls.tsx` — Updated `skinPill()` to use frost recipe (matching useGlassHighlight).
- `src/styles/globals.css` — Aligned CSS fallback hover to frost recipe (mode-aware light/dark). Added dark mode variant to pill suppression rule for specificity. Removed unused `[data-glass-link]` CSS rules.

**Key decisions:**
- **Three pill systems, one recipe:** Project cards (main container, sticky bounds), Mochi Health (main container, tight bounds), and contact links (own container, tight bounds) all use the same frost glass visual recipe but different interaction behaviors.
- **`cardSelector` config:** Prevents the project card pill on `<main>` from detecting contact links. Each `useGlassHighlight` instance only responds to its own selector.
- **Per-card `data-tight-bounds`:** Mochi Health shares the project card container (so the pill can slide between them) but has individual tight bounds. This is a hybrid: shared pill, mixed clearing behavior.
- **400ms delay for tight-to-stack transitions:** When leaving a tight-bounds card toward the card stack, the clear timer is longer (400ms vs 150ms) so the cursor can reach the next card before the pill fades. Entering the next card cancels the timer and triggers a smooth slide.
- **Contact links `clearDelay: 300`:** More forgiving than project cards (150ms) because the links are farther apart (across paragraphs with 32px gap).

**Files changed:** HeroTitle.tsx, AboutSection.tsx, useGlassHighlight.ts, SidebarThemeControls.tsx, globals.css, design-language.md, history.md

---

## 2026-02-23 — Serif narrative text: extend typographic voice to editorial passages

**Branch:** `serif-narrative-text`

**Summary:** Narrative text (section intros and about section paragraphs) now uses Literata serif at 22px/300 instead of Onest sans at 18px/400. This creates a two-voice typographic system where the serif voice (Literata) carries the author's editorial tone — heading + narrative — and the sans voice (Onest) carries navigational/functional content — project links. About section paragraph gap increased from 24px to 32px to restore proportional breathing room at the larger text size.

**What changed:**
- `src/components/Section.tsx` — Narrative paragraphs: `fontFamily: 'Literata', serif`, `fontSize: 22`, `fontWeight: 300`, `lineHeight: 1.4` (was Onest 18px/400/1.2)
- `src/components/AboutSection.tsx` — Same narrative styling. Paragraph gap: `32px` (was 24px)
- `core-docs/design-language.md` — Typography section rewritten: "The typographic pairing" → "The two-voice system." Documented the serif/sans voice split rationale, added Narrative row to the scale table (22px/1.4/Tertiary), updated spacing table to include about section gap at 32px, updated coherence checklist
- `core-docs/history.md` — This entry

**Key decisions:**
- **Serif for narrative, not just headings:** The narrative text is authorial voice — it sets context and establishes tone, functionally closer to the heading than to project links. Giving it Literata creates a clear editorial backbone (serif = author speaking) that the sans project links (work speaking) hang from. This is a stronger conceptual split than the previous "serif = big, sans = everything else."
- **22px, not 20px or 24px:** 22px provides a clear step up from 18px links (1.22×) and a clear step down from 36px heading (1.64×). The narrative catches your eye via size, links draw you in via contrast and underline. 20px was too subtle; 24px competed with the heading.
- **Weight 300, matching heading:** The shared weight reinforces the familial connection between heading and narrative — both are the same voice at different volumes. The 300/400 weight contrast now maps cleanly to serif/sans rather than heading/body.
- **About section gap 24px → 32px:** At 22px/1.4, line height is ~31px. The previous 24px gap (0.77× line height) was proportionally tighter than it had been at 18px (0.96×). 32px restores ~1.03× line height of air and aligns with the spacing hierarchy's "within-section" tier.
- **Narrative-to-cards gap left at 32px:** The visual gap is 56px (32 + 24px card padding), which is 1.8× the narrative line height — generous enough. The narrative and cards are meant to read as one group; loosening that coupling would weaken the grouping.
- **Line-height 1.4 for narrative:** More generous than the heading's 1.2. Literata at 22px reads better with more leading, and the taller line-height helps distinguish narrative rhythm from the heading's tighter setting.

**What was explored:** Built a dev panel (NarrativeFontPanel) to toggle between serif and sans variants at 22px in real-time. Both variants were evaluated at weight 300. Serif was the stronger choice — the sans variant looked like slightly bigger body text without adding meaning, while the serif signaled editorial intent. Dev panel stripped before merge per dev panels policy.

**Files changed:** Section.tsx, AboutSection.tsx, design-language.md, history.md
**Files deleted (dev panel):** NarrativeFontPanel.tsx, NarrativeFontContext.tsx

---

## 2026-02-23 — Continuous background intensity slider

**Branch:** `continuous-intensity-slider`

**Summary:** Converted the background intensity system from a discrete 4-step integer model (0–3) to a continuous float range (0.0–1.0), enabling smooth, stepless control over accent color intensity. Replaced index-based level lookups with a pure linear interpolation function (`computeBg`), added direct DOM mutation during drag for zero-lag visual feedback, and updated ARIA attributes to reflect a 0–100 percentage range.

**What changed:**

- **`src/contexts/ThemeContext.tsx`** — `INTENSITY_LEVELS` simplified to reference presets with `t` positions. New exported `computeBg(accent, mode, t)` function: `satMult = 1.0 + 1.8 * t`, `lightShift = -10 * t` (light) / `2 * t` (dark). State initialized as float with migration logic for old integer values. Effect uses `< 0.001` threshold instead of `=== 0` for float precision.
- **`src/components/SidebarThemeControls.tsx`** — Imports `computeBg` instead of `INTENSITY_LEVELS`. Added `lerp()` helper for continuous interpolation of glow/opacity. `KEYBOARD_STEP = 0.05`. Drag handler sets `t = y / STRIP_HEIGHT` (float). Direct DOM mutations during drag: thumb position, `--bg` CSS variable, trigger glow/opacity, meta theme-color. Body transition suppressed during drag and restored on pointer up. ARIA updated to `aria-valuemax={100}`, `aria-valuenow` as percentage.

**Key decisions:**
- **Direct DOM mutations during drag for zero-lag feedback:** React state is still the source of truth (setBgIntensity called on every pointer move), but during active drag, DOM is mutated directly to bypass the React render cycle. Body transition is suppressed during drag to prevent CSS transitions from fighting direct updates.
- **Named presets kept as reference:** `INTENSITY_LEVELS` array retained with `t` values (0, 0.33, 0.67, 1) for potential future labeling but no longer drives the math.
- **Migration for old localStorage values:** `(Number.isInteger(parsed) && parsed >= 1 && parsed <= 3) ? parsed / 3 : parsed` — correctly maps old integers 1, 2, 3 to their proportional 0–1 equivalents while leaving values already in the 0–1 range unchanged.

**Files changed:** ThemeContext.tsx, SidebarThemeControls.tsx, core-docs/design-language.md, core-docs/plan.md, core-docs/history.md

---

## 2026-02-23 — Add contact links and resume to about section

**Branch:** `home-page-refinements`

**Summary:** Updated AboutSection with email, LinkedIn, and resume links. Hosted resume PDF in `public/`.

**What changed:**
- `src/components/AboutSection.tsx` — Contact paragraph now links to email (mailto) and LinkedIn. Added "Just lurking?" paragraph linking to resume PDF.
- `public/ben-yamron-resume.pdf` — Resume hosted as static file.

**Files changed:** AboutSection.tsx, public/ben-yamron-resume.pdf (new)

---

## 2026-02-23 — Subtle glass hover: reduce pull/squash, add minimum width clamp

**Branch:** `subtle-glass-hover`

**Summary:** Reduced the glass pill's gravitational pull and squash deformation for a more restrained feel, and added a minimum width clamp so the pill never collapses to zero padding around the text during volume preservation.

**What changed:**
- **`src/hooks/useGlassHighlight.ts`** — `pullStrength` 0.25 → 0.12 (gentler edge gravity), `squashAmount` 0.003 → 0.001 (barely perceptible perpendicular compression). Added `minW = state.baseW - 24` clamp in `computePullTargets()` so volume preservation never shrinks the pill below 4px padding on each side.
- **`core-docs/design-language.md`** — Updated squashAmount, pullStrength defaults in both the Motion section and configurator table. Documented minimum width clamp in the volume preservation description.

**Key decisions:**
- **Pull halved, not removed:** 0.12 still gives the pill physical weight at card edges without the aggressive narrowing that was visible at 0.25.
- **Width clamp at baseW - 24px:** Card has 16px horizontal padding; clamping at -24px guarantees at least 4px visible padding on each side even at maximum pull.
- **Squash 3x more subtle:** 0.001 is effectively invisible but keeps the deformation formula active for future tuning.

---

## 2026-02-22 — Home page refinements: scroll, hierarchy, copy, coming-soon cards

**Branch:** `home-page-refinements`

**Summary:** Refined the home page across four areas: scroll architecture, visual hierarchy, content copy, and coming-soon project treatment. Moved scrolling from the left column container to the document level, differentiated narrative text from project links via color, tuned the spacing hierarchy for better scannability, made project link arrows inline characters, and turned coming-soon projects into hoverable glass cards with muted styling.

**What changed:**

- **Scroll architecture** (`LeftColumn.tsx`, `useGlassHighlight.ts`): Removed `overflowY: auto` and `height: 100vh` from the left column so the page scrolls at the document level — scrollbar now appears at the right edge of the viewport instead of at the column boundary. Glass highlight scroll listener moved from container to `window`.
- **Text color hierarchy** (`Section.tsx`, `AboutSection.tsx`): Narrative/context text changed from `--text-medium` to `--text-grey` to create clear differentiation from project link text (`--text-dark`). Heading remains `--text-dark`.
- **Spacing hierarchy** (`LeftColumn.tsx`, `Section.tsx`): Heading-to-content gap reduced from 64px to 40px. Between-section gap increased from 40px to 56px. Within-section: 8px gap between context paragraphs, 32px marginTop before project cards, 24px between cards. Content container maxWidth increased from 480px to 528px.
- **Inline arrows** (`ProjectLink.tsx`): Changed link layout from `display: flex` + `gap: 4` to `display: inline-block` with the arrow as an inline Unicode character. This keeps the arrow and text on a single continuous underline that wraps together.
- **Coming-soon cards** (`ProjectLink.tsx`, `projects.ts`): Non-link projects changed from plain grey `<p>` elements to hoverable `<div>` cards with `data-link-card` attribute (glass effect works), `--text-medium` color, and an ellipsis `…` at 50% opacity instead of an arrow. All three side projects now have "(coming soon)" suffix.
- **Content copy** (`HeroTitle.tsx`, `projects.ts`): Heading updated to "Ben Yamron is a product designer. Currently leading design for patient experiences at Mochi Health." (Mochi is a link). Section 1 context: "I own product problems — from setting direction with leadership to shipping the details. These days, I'm deep in AI workflows across design and dev." Section 2 context: "Before Mochi, I took on design and research problems across different domains." UW case study title corrected to "Building the system that builds the system."

**Key decisions:**
- **Document-level scroll over container scroll**: The scrollbar at the column boundary felt like a UI artifact. Document scroll puts it at the viewport edge where users expect it. Glass highlight math is unaffected since card and container relative offsets are constant.
- **`--text-grey` for narrative, not `--text-medium`**: Creates a three-tier text hierarchy (dark → medium → grey) where narrative context recedes behind project links. Coming-soon cards use `--text-medium` — muted but more prominent than narrative text.
- **Inline-block links over flex**: Flex layout broke underline continuity between text and arrow. Inline-block preserves the single underline across the full link including the arrow character.
- **Coming-soon as hoverable cards, not plain text**: These are future projects, not disabled items. Glass hover signals interactivity and keeps them visually part of the project card system. Ellipsis icon distinguishes them from linked projects (which use →).

**Files changed:** LeftColumn.tsx, HeroTitle.tsx, Section.tsx, AboutSection.tsx, ProjectLink.tsx, projects.ts, useGlassHighlight.ts

---

## 2026-02-22 — Remove dev panels, add dev panel policy, branch cleanup

**Branch:** `preview-main-build`

**Summary:** Removed two dev control panels that had shipped to main: the font comparison panel (`FontPanel.tsx`, Cmd+Shift+T toggle) and the glass mode switcher (`GlassModeSwitcher.tsx`, always visible). Simplified `useGlassHighlight.ts` to hardcode the "frost" glass style instead of switching between 4 modes via `data-glass-mode`. Added a dev panel policy to `CLAUDE.md` and a pre-merge cleanup step (Step 9) to `workflow.md` so dev panels are always stripped before merging.

Also cleaned up 17 stale local branches, 8 stale remote branches, and 2 prunable worktrees (athens, davis) — all fully merged work.

**Files changed:**
- Deleted `src/components/FontPanel.tsx`, `src/components/GlassModeSwitcher.tsx`
- `src/App.tsx` — removed imports and renders
- `src/hooks/useGlassHighlight.ts` — removed `getGlassMode()`, hardcoded frost, removed `data-glass-mode` from observer
- `CLAUDE.md` — added dev panels policy section, updated glass hover description, removed GlassPanel from project structure
- `core-docs/workflow.md` — added Step 9 "Pre-Merge Cleanup"

---

## 2026-02-22 — Typography: Literata 300 + Onest 400

**Branch:** `byamron/font-comparison-panel`

**Summary:** Replaced single-typeface Manrope 400 system with a serif/sans pairing: Literata 300 (headings) + Onest 400 (body). Revised the design language philosophy to prioritize intentionality over restraint, and "memorable without being loud" over "quiet confidence." Built a dev-only font comparison panel to evaluate pairings in real-time before committing.

**What was explored:**
- **Heading serifs**: Newsreader, Lora, Literata, Source Serif 4
- **Body sans**: Manrope, Onest, Plus Jakarta Sans, DM Sans, Nunito, Outfit, Urbanist, Public Sans
- **Weight combinations**: 300/300, 300/400, 400/300, 400/400, 500/300

**Fonts eliminated and why:**
- **Newsreader**: Sharp serifs felt too old-style/editorial for a modern tech portfolio. High stroke contrast clashed with Onest's rounded warmth — "two fonts that disagree" rather than complement.
- **Lora**: Too similar to Newsreader's editorial character, less distinctive.
- **Source Serif 4**: Neutral and precise but lacked personality at display sizes. Paired with Manrope it felt generic.
- **DM Sans, Nunito, Plus Jakarta Sans, Outfit, Public Sans**: Eliminated during narrowing — either too generic, too playful, or didn't complement the serif options well.
- **Urbanist**: Clean and geometric but lacked the warmth that Literata needed in a partner.
- **Manrope (for body)**: Too common — the "Figma-era Helvetica." A typographically literate person wouldn't notice it as a deliberate choice.

**Why Literata + Onest:**
- Literata: contemporary serif designed for screens, soft serifs, generous x-height. At 300 weight it's light and elegant. Doesn't carry historical baggage like Newsreader. Reads as "quietly modern."
- Onest: warm rounded sans with enough personality to feel authored but subtle enough to not distract. Both fonts share a design sensibility — contemporary, clarity-first, considered.
- The pairing rewards typographic literacy ("they chose well") without calling attention to itself ("this looks clean").
- 300/400 weight gap creates hierarchy through contrast, not emphasis.

**Design language changes:**
- Principle 1 renamed: "Restraint as signal" → "Intentionality over restraint." Restraint is a tool, not a principle. Calculated risks are encouraged where they reward attention.
- Principle 3 renamed: "Quiet confidence over spectacle" → "Memorable without being loud." Being forgettable is a failure mode. Standing out through considered choices, not spectacle.
- Typography section: single-typeface rule replaced with serif/sans pairing philosophy.
- Anti-patterns updated: "don't add a second typeface" replaced with "don't add a third typeface." Weight rules updated to reflect heading/body weight contrast.
- Coherence checklist updated for new typography system.

**Implementation:**
- `index.html`: Google Fonts link loads Literata + Onest (replaced Manrope + Newsreader)
- `src/styles/globals.css`: Body font → Onest 400, added `h1, h2, h3 { font-family: 'Literata', serif; font-weight: 300 }`
- `src/styles/theme.css`: Subframe font variable overrides → Literata/Onest
- Components updated: HeroTitle, CaseStudySectionText, CaseStudyLayoutA (heading fontWeight → 300), CaseStudy (Onest body + Literata heading inline HTML), FontPanel defaults

**Dev tooling:**
- `src/components/FontPanel.tsx`: Dev-only floating panel (bottom-right) with 4 tabs (Fonts/Scale/Layout/Info). Toggle buttons for heading/body font, weight sliders, size/line-height sliders, content/image max-width sliders. Loads Google Fonts on-demand, injects CSS overrides with `!important`. Gated behind `import.meta.env.DEV`, tree-shaken from production. Keyboard shortcut: Cmd+Shift+T.

---

## 2026-02-22 — Case study layout prototype with sticky visuals and hero

**Branch:** `byamron/case-study-layout`

**Summary:** Designed, prototyped, and refined a case study page layout. Explored three directions (sticky companion, breakout visuals, Tufte-style sidebar), narrowed to the sticky companion column, and iterated through visual blocks grouping, responsive spacing, gallery section, and a 100vh hero with vertically centered text and visual.

**What was built:**
- **`src/data/case-study-content.ts`** — Typed data structure for case studies: `CaseStudy` (title, subtitle, timeline, heroVisual, sections, gallery), `CaseStudySection`, `CaseStudyVisual`, `GalleryItem`. Mochi Subscriptions fully populated with 5 sections (3 with visuals), 1 hero visual, and 6 gallery items.
- **`src/components/CaseStudyLayoutA.tsx`** — Two-column case study layout. 100vh hero row with vertically centered title (48px display) and hero visual. Each content section gets its own 100vh row with text left, sticky visual right. Visual carry-forward: `resolveVisuals()` ensures sections without their own visual show the most recent one (seeded by hero visual). Gallery section after narrative with full-width and 2-up grid patterns. Responsive: collapses to single column below 1200px.
- **`src/components/PlaceholderVisual.tsx`** — Gray rectangle placeholder (16:10, 32px radius, theme-adaptive) with optional caption.
- **`src/components/CaseStudySectionText.tsx`** — Shared text component: 24px h2 + 18px/1.4 paragraphs.
- **`src/components/CaseStudyPrototype.tsx`** — Wrapper with top/bottom fade gradients (20px linear fade).
- **`src/components/ViewSwitcher.tsx`** — Floating dev toggle for Main/Case Study view switching.
- **`src/hooks/useMediaQuery.ts`** — Shared responsive hook with `useIsWide()` (1200px breakpoint).

**Modified files:**
- **`src/App.tsx`** — View switching state between Layout and CaseStudyPrototype.
- **`src/styles/globals.css`** — Responsive layout spacing tokens (`--layout-margin`, `--layout-gap`, `--layout-padding-top`) with breakpoints at 1440/1200/768px.
- **`src/components/Layout.tsx`**, **`LeftColumn.tsx`**, **`RightColumn.tsx`** — Updated to use responsive spacing variables and `useIsWide()` hook.

**Key decisions:**
- **Dropped breakout layout (Direction B)**: IntersectionObserver-based layout transitions caused flickering and content reflow. Violated the design language anti-pattern against scroll-triggered animations. Structural problem, not fixable.
- **Per-section rows over visual blocks**: Initially grouped sections into "visual blocks" (multiple sections per row). Switched to one section per row so each gets its own 100vh space with one heading and its paragraphs — cleaner rhythm.
- **Visual carry-forward seeded by hero**: `resolveVisuals()` walks sections linearly, carrying the last visual forward. Hero visual seeds the initial value, so sections before the first visual still show the hero image.
- **48px display title**: Extended the type scale (14 → 18 → 24 → 36 → 48) for the case study hero. Follows the ~1.33× progression. Main page h1 stays at 36px.
- **50/50 column split**: Matches the main page. Text column achieves 50-70 char/line ideal at ~600px effective width.
- **Responsive layout tokens shared with main page**: CSS custom properties (`--layout-margin`, `--layout-gap`) used by both main page and case study, ensuring consistent spacing.

**Updated docs:** design-language.md (typography scale, case study layout rules), history.md

## 2026-02-22 — Font comparison dev panel

**Branch:** `byamron/font-comparison-panel`

**Summary:** Built a floating dev control panel for comparing Google Fonts typography on the live site. The panel dynamically loads fonts from Google Fonts and injects CSS overrides to swap heading/body typefaces, weights, sizes, and line-heights in real-time. Dev-only — excluded from production builds via `import.meta.env.DEV` gate.

**What was built:**
- **`src/components/FontPanel.tsx`** — Self-contained floating panel with 3 tabs (Fonts/Scale/Info). Dark chrome matching the Glass Configurator spec (#1a1a1a, #333 border, 14px radius). System sans-serif for panel UI. Framer Motion enter/exit animation. Keyboard shortcut (Cmd+Shift+T).
- **Font loading utility** — Injects `<link>` tags to `<head>` with `data-font-panel` attribute for cleanup. Tracks loaded fonts in a Set to avoid duplicate loads. Preloads all curated fonts on first panel open.
- **CSS override injection** — Injects a `<style id="font-panel-overrides">` tag with `!important` rules to override inline styles on components. Panel itself excluded via `[data-font-panel-root]` selector.
- **Curated font list (25 fonts)** — 15 sans-serif (Manrope, Inter, DM Sans, Space Grotesk, Outfit, Plus Jakarta Sans, Sora, Work Sans, Karla, Be Vietnam Pro, Figtree, Instrument Sans, Albert Sans, Nunito Sans, Rubik), 7 serif (Newsreader, Fraunces, Playfair Display, Source Serif 4, Lora, Crimson Pro, DM Serif Display), 3 monospace (JetBrains Mono, IBM Plex Mono, Space Mono).
- **Searchable dropdown** — Font items rendered in their own typeface for instant visual comparison. Grouped by category (sans-serif/serif/monospace). Active selection highlighted with blue left border.
- **Link toggle** — When on (default), one dropdown controls both heading and body font. When off, independent heading/body selectors appear.
- **Copy CSS** — Exports current font settings as CSS declarations to clipboard. Button turns green on success.

**Key decisions:**
- **`!important` overrides:** Components use inline `style` props for `fontWeight`/`fontSize`/`lineHeight`, which have highest CSS specificity. `!important` is the pragmatic choice for a dev tool — avoids refactoring production components for a temporary tool.
- **Single file, no context:** Panel is fully self-contained. Local state only, no persistence. Keeps the dev tool isolated from the portfolio architecture.
- **Mounted in App.tsx outside Routes:** Panel available on both home page and case study pages.
- **Production exclusion verified:** `import.meta.env.DEV` gate confirmed working — `grep` of production bundle shows zero FontPanel references.

**Files changed:** FontPanel.tsx (new), App.tsx (import + mount)

## 2026-02-22 — Background intensity control with gradient strip in sidebar

**Branch:** `byamron/bg-intensity-panel` → merged to `main` via PR #15

**Summary:** Added a background intensity system that scales saturation and lightness across all 4 accent themes × 2 appearance modes. Explored multiple control patterns (segmented buttons, ring cycle, gradient strip) and placement variants (under modes, under swatch, above modes). Landed on a draggable gradient strip placed between swatches and mode icons.

**What was built:**
- **Intensity system in `ThemeContext.tsx`** — 4 levels (Whisper, Subtle, Tinted, Warm) with per-level saturation multiplier and lightness shift. At intensity 0, CSS `--bg` variable is untouched (cascade takes over). At 1+, `computeBg()` generates an HSL override applied via `document.documentElement.style.setProperty('--bg', ...)`. Persisted to localStorage as `bgIntensity`.
- **Gradient strip in `SidebarThemeControls.tsx`** — 72px tall, 8px wide gradient bar with 11px draggable thumb. Uses Pointer Capture API for smooth drag. Thumb travels full strip length (top-flush at intensity 0, bottom-flush at intensity 3). Keyboard accessible via arrow keys.
- **Trigger glow + opacity** — The sidebar trigger dot (16×16) reflects intensity via combined atmospheric indicators: opacity scales from 0.45 → 1.0, box-shadow glow spreads from 0 → 14px. Both use the active swatch color.
- **Split pill containers** — Glass pill system split into two independent instances (swatches, modes) so the hover clears when cursor enters the intensity strip area between them.

**Key decisions:**
- **Gradient strip over ring cycle:** Ring was not discoverable enough — a single squircle cycling through 4 states on click lacked clear affordance. Gradient strip is continuous and self-descriptive.
- **Above-modes placement over under-swatch:** The strip is a global setting (persists across all swatches), so placing it under the active swatch implied per-swatch ownership. Above-modes creates a clean three-tier hierarchy (color → intensity → mode) with no layout instability.
- **Trigger uses atmospheric, not structural indicators:** Rejected color (desaturation), ring (outline), and size (growth) — all modified the trigger's identity or structural role. Glow + opacity layer on top of the trigger's fixed identity without altering shape, size, or color. See `core-docs/feedback.md` for full rationale.
- **Split pill containers:** Single container caused the glass pill to linger on the nearest swatch/mode when cursor entered the strip. Two containers with independent pill lifecycles match the project card behavior (pill clears when leaving a group).
- **Dark mode intensity tuning:** Initial dark mode lightShiftDark values were too light. Reduced to [0, 1, 1.5, 2] to keep dark backgrounds dark even at Warm intensity.

**Iteration path:** Segmented buttons → removed Vivid level → dark mode tuning → sidebar integration brainstorm (4 options) → gradient strip + ring cycle prototypes → gradient strip chosen → above-modes + under-swatch placement variants → above-modes chosen → trigger indicator exploration (5 variants) → glow + fill combined → split pill containers → thumb full-travel fix

**Files changed:** ThemeContext.tsx, SidebarThemeControls.tsx, App.tsx, core-docs/feedback.md. Deleted: BgIntensityPanel.tsx

## 2026-02-22 — Link all case studies via React Router, remove dev toggle

**Branch:** `byamron/link-case-studies`

**Summary:** Connected all 8 case study project cards on the home page to dedicated case study pages using React Router. Removed the dev ViewSwitcher toggle. Converted all markdown case study content into typed `CaseStudy` objects and wired them through the existing `CaseStudyLayoutA` template. Side projects without case studies changed to non-interactive text.

**What was built:**
- **`src/data/case-study-content.ts`** — Added 7 new typed `CaseStudy` objects (mochiAiTooling, mochiProgressTracker, uwDesignSystem, sonyScreenlessTv, cipElectionMisinformation, duolingoLanguagesFlags, acornEatLocalVt) alongside existing mochiSubscriptions. Exported `caseStudiesBySlug` lookup map for O(1) route resolution.
- **`src/components/CaseStudyPage.tsx`** — New route component: reads slug from URL params, looks up CaseStudy data, renders CaseStudyLayoutA with back link and edge fades. Scroll-to-top on navigation. Not-found fallback.
- **`src/App.tsx`** — Replaced ViewSwitcher + conditional rendering with React Router `<Routes>`: `/` → Layout, `/project/:slug` → CaseStudyPage.
- **`src/main.tsx`** — Wrapped app in `<BrowserRouter>`.
- **`src/data/projects.ts`** — Changed `todo-priority` and `detect-manip` from `isLink: true, href: '#'` to `isLink: false` (grey non-interactive text).

**Deleted files:**
- `src/components/ViewSwitcher.tsx` — Dev toggle, no longer needed
- `src/components/CaseStudyPrototype.tsx` — Replaced by CaseStudyPage
- `src/components/CaseStudy.tsx` — Unused markdown renderer

**Decisions:**
- Used typed CaseStudy objects (not raw markdown rendering) so content goes through the same CaseStudyLayoutA two-column sticky layout
- mochi-ai-tooling is a stub (empty sections, "Content coming soon" subtitle) — layout degrades gracefully
- CIP election misinformation structured as 2 sections (one per paper) with authors and abstracts as paragraphs
- ThemeProvider and HoverProvider remain outside Routes so theme state persists across navigation

---

## 2026-02-22 — Tune glass hover physics and fix card stack boundary

**Branch:** `byamron/glass-hover-fix`

**Summary:** Refined the glass pill hover behavior based on hands-on testing: reduced squash deformation for subtlety, increased gravitational pull for more weight, and fixed a bug where the hover persisted when the cursor moved above or below the card stack.

**What changed:**
- **`src/hooks/useGlassHighlight.ts`** — `squashAmount` 0.01 → 0.003 (more subtle perpendicular compression), `pullStrength` 0.15 → 0.25 (stronger edge gravity). Added `isCursorInCardStack()` geometric check: on non-card mouseover, hover only clears when cursor Y is outside the vertical bounds of the first-to-last card range. 150ms delay on clear for soft exit. Gaps between cards, context paragraphs, and section breaks all preserve the hover.
- **`src/components/ProjectLink.tsx`** — Removed `react-router-dom` `Link` import (no router configured yet). All links use plain `<a>` tags.
- **`src/App.tsx`** — Default view switched from `'case-study'` to `'main'`.

**Key decisions:**
- **Geometric boundary, not time-based debounce:** First attempt used a 60ms debounce to clear hover on non-card areas — too aggressive, caused flicker when sliding between cards. Replaced with `isCursorInCardStack()` which checks if cursor Y is between the first card's top edge and the last card's bottom edge. Within that range, hover never clears regardless of what element the cursor is over.
- **150ms clear delay:** When cursor exits the card stack bounds, a 150ms timeout softens the disappearance. Cancelled if cursor re-enters a card.
- **Pull strength increase felt more physically grounded:** 0.15 felt too easy/flexible — the pill floated. 0.25 gives the pull more weight and makes it feel like the pill is being drawn toward neighbors with real force.
- **Squash barely perceptible is correct:** 0.01 was visible enough to look rubbery. 0.003 is felt more than seen — it sells the physical metaphor without calling attention to itself.

**Updated docs:** design-language.md (squashAmount, pullStrength defaults, card stack boundary exit rule), history.md

## 2026-02-21 — Sidebar theme controls with glass pill hover

**Branch:** `byamron/react-portfolio-build`

**Summary:** Built, iterated, and polished the right-edge sidebar for theme/accent controls. Explored three placement variants (below image, floating popover, right sidebar), consolidated into a single hybrid design, and added a mini glass pill hover system matching the project card glass language.

**What was built:**
- **`src/components/SidebarThemeControls.tsx`** — Consolidated sidebar: fixed trigger dot (16×16, r=5) + expandable toolbar with swatches, dividers, and mode icons. Staggered slide-in animation (0.22s, 0.04s stagger). 250ms close delay for edge tolerance.
- **Mini glass pill** (`setupControlPill`) — Imperative pill system adapted from `useGlassHighlight`: 36×36 fixed size, r=12 (concentric with 24px swatches at r=6). RAF lerp at 0.2 speed. Theme-reactive via MutationObserver. z-index 10 with `contain: layout style` for proper backdrop-filter compositing.
- **Removed:** `FloatingThemeControls.tsx`, `ThemeControls.tsx`, `ModeSwitcher.tsx`, `AccentPicker.tsx` (all consolidated into SidebarThemeControls)

**Key decisions:**
- **Pill sits ON TOP of controls (z-index 10):** backdrop-filter only creates visible blur when there's varied content behind the element. With z-index 0 (behind controls), the pill was blurring a uniform dark background — invisible. z-index 10 matches useGlassHighlight and blurs the swatch/icon content below.
- **Fixed 36×36 pill size for all controls:** Both swatches (24px) and mode buttons (40px tap target, 24px icon) get the same pill. Position calculated from control center point, not element edges. Ensures visual consistency across control types.
- **Concentric radius calculation:** Pill r=12 = swatch r(6) + padding((36-24)/2 = 6). Selection outline at outlineOffset 3 has effective r≈9. Three concentric rings: swatch (r=6) → outline (r≈9) → pill (r=12).
- **Two dividers for structural clarity:** One between trigger and swatches, one between swatches and modes. Both animate in/out with the toolbar. Same style (width 20, height 1, var(--text-dark) at 0.15 opacity, margin 18px).
- **Selected state indicators:** Swatches use 1.5px outline in swatch color at 50% opacity (via `color-mix`). Mode icons use 1.5px outline in `var(--text-dark)` at 20% opacity — adapts to theme (white in dark mode, black in light mode). Mode icons shrunk to 18px inside 24×24 span for breathing room. Both use outlineOffset 3.
- **Hover on selected items preserved:** Glass pill shows on all items including the active one. Hover = spatial feedback, selection = state feedback — suppressing hover creates dead zones.
- **Small trigger dot, not rounded square:** Tested both via dev toggle. The dot differentiates the trigger from the selectable swatches below without competing visually.

**Iteration path:** 3 variants (A/B/C) → user testing → consolidated hybrid → size/spacing tuning → rounded squares everywhere → glass pill added → pill size normalized → blur fix (z-index) → selected state borders → border refinement (1.5px, lighter colors, smaller icons)

**Files changed:** SidebarThemeControls.tsx (new), Layout.tsx, core-docs/design-language.md, core-docs/history.md, core-docs/feedback.md

## 2026-02-21 — Accessibility fixes for glass highlight scaffolding

**Branch:** `byamron/glass-hover-gravity` → pushed directly to `main`

**Summary:** Fixed three accessibility gaps identified post-merge: missing semantic landmarks, non-reactive reduced motion preference, and `dangerouslySetInnerHTML` in Section.tsx.

**What changed:**
- **Semantic landmarks**: LeftColumn now uses `<main>`, RightColumn uses `<aside>` (was `<div>` for both)
- **Reactive reduced motion**: `prefers-reduced-motion` media query now has an `addEventListener('change', ...)` handler, so toggling the system preference mid-session immediately updates the glass config (previously only checked once at setup)
- **Removed `dangerouslySetInnerHTML`**: Changed `contextParagraphs` from `string[]` to `ReactNode[]`, renamed `projects.ts` → `projects.tsx`, Section.tsx now renders children directly

**Files changed:** Layout.tsx, LeftColumn.tsx, RightColumn.tsx, Section.tsx, projects.ts→projects.tsx, useGlassHighlight.ts

## 2026-02-21 — Glass hover highlight with gravitational pull

**Branch:** `byamron/glass-hover-gravity`

**Summary:** Built the portfolio's signature interaction: a single glass pill element that lives on the LeftColumn container, slides smoothly between project links via RAF lerp, and gravitationally pulls toward neighboring cards when the cursor drifts to card edges. Also built all prerequisite scaffolding (contexts, layout, project data, components).

**What was built:**
- **`src/hooks/useGlassHighlight.ts`** (~300 lines) — Fully imperative physics system. One `requestAnimationFrame` loop drives all pill movement: card-to-card slides, gravitational pull, and volume-preserving stretch. Glass visual recipe (6 layers: fill, radial highlight, backdrop blur, inner glow, border, shape). Theme reactivity via MutationObserver. Scroll/resize tracking. Keyboard focus support. Reduced motion support.
- **`src/data/projects.ts`** — All 11 projects across 3 content sections with types
- **`src/contexts/HoverContext.tsx`** — Hovered project ID state
- **`src/contexts/ThemeContext.tsx`** — Minimal: reads HTML attributes, exposes accent/appearance
- **`src/components/`** — ProjectLink, Section, HeroTitle, AboutSection, LeftColumn, RightColumn, Layout
- **`src/App.tsx`** — Wired providers + Layout
- **`src/styles/globals.css`** — Body background, full glass CSS hover fallback (radial gradient, 6 inset shadows, backdrop blur), `[data-glass-highlight-active]` override

**Key decisions:**
- **Unified RAF lerp for all motion** (no CSS transitions on position): The first approach used CSS transitions for card-to-card slides with a separate RAF loop for gravitational pull. This caused the two systems to fight — the RAF loop overwrote the CSS transition, causing abrupt jumps. The fix: one RAF loop with exponential lerp (`lerpSpeed: 0.15`) drives ALL pill movement. When hovering a new card, the target updates but current stays at the old position — the lerp naturally produces smooth deceleration. See `feedback.md` for the full lesson.
- **Container-level pill, not per-card**: The glass pill is a single absolutely-positioned div inside the LeftColumn container. It slides between all `[data-link-card]` elements as one continuous object — matching the Framer original where the code override was applied to the section, not individual cards.
- **Cards use `width: fit-content`**: ProjectLink elements shrink to their text content so the pill hugs the text rather than spanning the full column width. `padding: 24px 16px` with `margin: 0 -16px` keeps text aligned with surrounding paragraphs.
- **Smart RAF lifecycle**: Loop stops when pill settles (all dimensions within 0.3px of target). Restarts on `mousemove`. Zero wasted frames when cursor is stationary.
- **Only CSS transition is opacity**: Fade in/out uses `opacity` CSS transition. Everything else is RAF-driven.
- **CSS hover fallback**: Full glass recipe (radial gradient, 6 inset box-shadows, backdrop blur) applied via CSS for pre-JS state. Disabled by `[data-glass-highlight-active]` once the hook attaches.
- **RightColumn is a placeholder**: Shows static portrait-table.jpeg. Image swap on hover is not wired yet.

## 2026-02-21 — Subframe component library, Tailwind v4, and theme integration

**Branch:** `main`

**Summary:** Installed Subframe UI component library (44 components), Tailwind CSS v4, and wired up the portfolio's design token system so Subframe components visually match the portfolio's "table" accent theme.

**What was added:**
- **Subframe CLI + components**: `npx @subframe/cli init` with project ID `b82957b2b077`, synced 44 components to `src/ui/` (Button, Dialog, TextField, Accordion, Charts, etc.) plus 3 layouts (DefaultPageLayout, DialogLayout, DrawerLayout)
- **Tailwind CSS v4**: Installed `tailwindcss` + `@tailwindcss/vite` plugin; CSS-first configuration via `@import "tailwindcss"` in globals.css
- **Portfolio design tokens**: Populated `src/styles/theme.css` with all 15 tokens from `tokens.md` — 7 text colors (appearance-only), 8 background colors (4 accents × 2 modes), 4 constant swatches, plus `--accent-hue`
- **Subframe theme overrides**: Added CSS variable overrides in `src/styles/theme.css` that load after Subframe's `src/ui/theme.css` and win via cascade — maps Subframe's `--font-*`, `--color-*`, and `--text-*--font-weight` tokens to portfolio values
- **Font configuration**: Google Fonts link updated for Manrope (wght 300–700) + Newsreader (wght 300–700)

**Key decisions:**
- **CSS cascade override strategy** (not `edit_theme`): The Subframe `edit_theme` MCP tool is AI-driven and interprets descriptions loosely — 3 attempts produced wrong fonts (Plus Jakarta Sans, Lora, Inter) and wrong colors. Instead, all Subframe variable overrides live in `src/styles/theme.css` which loads after `src/ui/theme.css` and wins via CSS specificity. This means `npx @subframe/cli sync` can safely overwrite `src/ui/theme.css` without losing our customizations.
- **"Table" accent as Subframe base theme**: The portfolio has 4 switchable accent themes but Subframe expects a single brand color. Chose "table" (warm gold, `hsl(34, 50%, 60%)`) as the Subframe default. Subframe's `--color-brand-primary` and `--color-default-background` reference portfolio CSS variables (`var(--swatch)`, `var(--bg)`) so they respond to `data-accent` attribute changes.
- **Newsreader for Subframe headings**: Subframe's `--font-heading-*` tokens are set to Newsreader (serif) while body/caption remain Manrope. This applies only to Subframe components; the portfolio's own components follow the single-typeface rule (Manrope 400 throughout) per `design-language.md`.
- **Tailwind v4 (not v3)**: CSS-first config with `@tailwindcss/vite` plugin — no `tailwind.config.js` needed. Theme variables defined in CSS, not JS.

**CSS import order** (in `src/styles/globals.css`):
```
@import "tailwindcss";         → Tailwind base + utilities
@import "../ui/theme.css";     → Subframe theme (synced, do not edit)
@import "./theme.css";         → Portfolio tokens + Subframe overrides (wins via cascade)
```

**New files:**
- `.subframe/sync.json` — Subframe project config (projectId, directory, cssType)
- `src/ui/` — 44 synced components, theme.css, utils.ts, index.ts, 3 layouts

**Modified files:**
- `vite.config.ts` — added `@tailwindcss/vite` plugin
- `src/styles/globals.css` — added 3 `@import` lines
- `src/styles/theme.css` — populated with all tokens + Subframe overrides
- `index.html` — expanded Google Fonts link (added Newsreader, expanded Manrope weights)
- `package.json` — added `@subframe/core`, `tailwindcss`, `@tailwindcss/vite`
- `.gitignore` — added `.vite/`

**Updated docs:** CLAUDE.md, plan.md, history.md

## 2026-02-21 — Extracted all Framer reference data, deleted reference files

**Branch:** `byamron/cleanup-file-structure`

**Summary:** Audited all 10 Framer `.tsx` reference files, extracted every implementation-critical detail into `core-docs/design-language.md` and `core-docs/plan.md`, then deleted the `reference/` directory entirely. The project no longer depends on any Framer code.

**What was extracted:**
- Glass fill color computation algorithm (hue extraction, saturation/brightness recipe, fallback color)
- Dynamic radial highlight gradient formula (intensity scaling with fill brightness)
- Border light simulation (directional `baseIntensity` formula with 1.2x/1.0x/0.8x multipliers)
- Inner glow multipliers (top `0.4`, bottom `0.15`)
- Complete glass config defaults for all 3 panel tabs: Fill (7 params), Shadow (5 params), Motion (10 params) with ranges and steps
- Stretch/squash deformation formulas (`peakSx`/`peakSy` computation, distance normalization, 3-keyframe structure)
- Gravitational pull physics (volume preservation formula, max stretch/translate calculations, layout detection)
- Theme-to-image mapping (table→portrait-table.jpeg, etc.)
- Z-index stacking order (pill: 10, link content: 1)
- Link card padding clarification (card: 8px 12px, glass pill: 0 padding, sizes to bounding box)
- Mode switcher details (localStorage key `"appearanceMode"`, button gap 8px, padding 8px, ARIA labels)
- 6 named easing curve presets (Smooth, Material, Expo Out, Quint Out, Snap, Spring)

**What was deleted:** All 10 files in `reference/`

**Updated docs:** CLAUDE.md, plan.md, design-language.md

## 2026-02-21 — Project scaffolding and file structure cleanup

**Branch:** `byamron/cleanup-file-structure`

**Summary:** Reorganized the repo from a loose collection of Framer reference files into a proper Vite + React + TypeScript project structure, ready for development.

**What changed:**
- Moved all 10 Framer `.tsx` reference files from repo root into `reference/` directory — they remain in git for consultation but are excluded from the build and linting
- Initialized Vite + React + TypeScript project with `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Installed core dependencies: React 19, Framer Motion, Phosphor Icons
- Created full `src/` directory structure: `contexts/`, `components/`, `hooks/`, `styles/`, plus entry files (`main.tsx`, `App.tsx`, `globals.css`, `theme.css`)
- Added `.gitignore` (node_modules, dist, .env, .DS_Store, .context)
- Added ESLint config with TypeScript and React hooks plugins (ignores `reference/`)
- Set up `@/` path alias for clean imports
- Configured Manrope font via Google Fonts in `index.html`
- Set default `data-theme="dark"` and `data-accent="table"` on `<html>`
- Verified clean build (432ms, ~61KB gzipped JS)

**Key decisions:**
- `reference/` at project root (not inside `src/`) — these files are not part of the build, just documentation
- Manual Vite setup rather than `create-vite` scaffold — gives full control over what's included
- React 19 — latest stable, no reason to pin older
- ESLint 9 flat config — modern standard
- Path alias `@/` → `src/` for clean imports from any depth
- No Tailwind yet — the plan lists it for Phase 0 but it can be added when actual layout work begins

**Updated docs:** CLAUDE.md project structure, plan.md reference file paths

## 2026-02-21 — React Component Architecture Analysis

**Branch:** byamron/react-component-plan
**Summary:** Deep analysis of all 10 Framer components and their interactions. Designed the React architecture that delivers identical interactive behavior with dramatically less complexity.

**Key decisions:**
- **Two React Contexts replace all globals**: `ThemeContext` (accent + appearance) and `HoverContext` (hovered project ID). No `window.__themeState`, no `window.__hoverState`, no custom events.
- **ImageDisplay merges Theme_Image + Hover_Preview**: A single component reads both contexts to determine which image to show. Eliminates N separate Hover_Preview instances.
- **GlassHighlight stays imperative, wrapped in a hook**: `useGlassHighlight(containerRef, config)` wraps the same RAF-based pill animation. The DOM manipulation approach is correct for 60fps animation — React state would cause excessive re-renders.
- **Theme color for glass pill**: Read `--swatch` from computed style on `:root` instead of the 50-line `getTokenColor()` → `findFramerTokenElement()` chain. Use `MutationObserver` on `data-accent` attribute instead of `window.__themeState.listeners`.
- **ThemeBackgroundLayer eliminated entirely**: Replaced by `body { background-color: var(--bg) }` in CSS.
- **No timing hacks**: All `setTimeout(50-100ms)` delays are Framer-specific. React state updates + CSS variable resolution are synchronous.
- **`data-link-card` attribute preserved**: GlassHighlight's DOM queries use it to find hoverable cards — this stays the same.

**Component line count reduction estimate:**
- Framer total: ~3,370 lines across 10 files
- React equivalent: ~950 lines across ~15 files (smaller, focused modules)

**Full architecture plan:** `core-docs/initial-implementation.md`

## 2026-02-20 — Created design-language.md, integrated token system

**Branch:** `byamron/design-language-doc`

**Summary:** Created `core-docs/design-language.md` — a comprehensive design language specification that codifies the visual and interaction rules governing the site. Derived from analysis of all 8 screenshots across themes, all 10 original Framer components, and the existing CLAUDE.md and plan.md documentation. Subsequently merged main (which added `tokens.md`) and updated the Color section to use precise HSL token values and document the three-tier token architecture.

**Key decisions:**
- Structured the doc around principles and rules rather than just values — it explains the _why_ behind every choice, not just the _what_
- Included an explicit anti-patterns section to prevent common deviations (second typeface, drop shadows, scroll animations, etc.)
- Added a coherence checklist for verifying implementation consistency
- Positioned design-language.md as the first file to read before any design/implementation work, referenced in both CLAUDE.md and plan.md
- Documented the three-tier token architecture: text colors (appearance-only), backgrounds (accent + appearance), swatches (constant). This structural insight is critical for implementation — it defines which things feel ambient vs thematic.
- Replaced approximate RGB color values with precise HSL tokens from `tokens.md`, cross-referencing tokens.md for implementation values
- Filled in portrait accent details (previously TBD)
- Noted 4 image variants (not 5) per the doc-review findings

**Technical details:**
- Updated CLAUDE.md core docs table to include design-language.md with its purpose and update trigger
- Added a new rule in CLAUDE.md requiring design-language.md review before any design/implementation work
- Added a cross-reference callout at the top of plan.md linking to design-language.md as the source of truth for visual decisions
- Merged main (PR #3: doc-review) to incorporate tokens.md and related doc updates
- Added token-specific items to the coherence checklist

## 2026-02-20 — Documentation Review & Color Token Extraction

**Branch:** byamron/doc-review
**Summary:** Deep review of all Framer reference components and documentation. Clarified component relationships, identified gaps, extracted color tokens from the live Framer site.

**Key decisions:**
- **SectionHighlight is dropped.** GlassHighlight.tsx is the only glass pill component needed — SectionHighlight was an earlier iteration.
- **Theme_Image uses 4 variants**, not 5. The 5th variant slot in the original is vestigial.
- **Typography baseline**: Manrope, 18px body / 36px headings, regular weight, 120% line height.
- **Glass pill defaults**: Use the values from GlassHighlightControls.tsx as the starting spec. Will be refined through testing.
- **Color tokens extracted**: 7 text tokens (appearance-dependent only), 4 theme backgrounds (theme + appearance), 4 swatch accents (constant). All documented in `tokens.md`.
- **Text colors are theme-independent** — they only change with light/dark, not with theme selection.
- **Framer-only tokens ignored**: Default, Default Frosted, Extra Light, Mochi Blue, UW Purple, Surface-Subtle, Surface-80, Tint — not needed for portfolio theming.

**Technical details:**
- Documented full data flow for theme changes, appearance mode changes, hover previews, and glass highlight interactions
- Identified that Framer timing hacks (50-100ms setTimeout delays) are unnecessary in React
- GlassHighlight uses raw DOM manipulation (createElement, Web Animations API, rAF lerp loop) — needs useEffect-based integration
- Updated reference file mapping table with migration status for each file
