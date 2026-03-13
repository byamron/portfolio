# Design Language

The visual and interaction rules that govern every detail of the site. This document is the source of truth for how things should look, feel, and behave — not just what values to use, but why. Reference this before making any design or implementation decision.

> **Implementation values**: For exact HSL token values and a draft CSS implementation, see `tokens.md`. This document provides the principles and rules; `tokens.md` provides the numbers.

---

## Core Principles

### 1. Intentionality over restraint

Every element on the site earns its place — not by being minimal for minimalism's sake, but by being thoughtful. There is generous whitespace. There are no decorative elements, no gradients-for-gradients'-sake, no badges or flourishes. But restraint is a tool, not a principle: the site takes calculated risks where they reward attention. Typography, hover interactions, and material choices are areas where the site can be bold and specific — as long as boldness serves the work rather than seeking applause. When a visitor sees this level of intentionality, they infer the same care in the work.

### 2. The site is the portfolio piece

Before anyone reads a word or clicks a link, the site has already made its case. The quality of the typography, the feel of the hover interactions, the cohesion across themes — these are the first evidence of taste. Implementation craft is not behind-the-scenes infrastructure; it _is_ the portfolio.

### 3. Memorable without being loud

The site should stand out — this is a portfolio, and being forgettable is a failure mode. But standing out comes from considered choices that reward a closer look, not from spectacle. The glass effect is barely-there until you notice it. The typography pairing is a quiet nod to those with an eye for taste. The theme switching is ambient. The whole experience says "I have a point of view" — and the people this site is built for (design-literate teams at companies like Figma, Anthropic, Stripe) will notice the care. Closer to nelson.co than to Dribbble, but not afraid to take a risk that lands.

### 4. Complex information made simple

This is Ben's core value proposition, and the site should embody it structurally. The two-column layout separates content from context. The spacing hierarchy creates effortless scanning. The theme system adds richness without adding complexity. A visitor should never feel lost or overwhelmed.

### 5. Authored, not generated

The site should feel like it was made by a specific person with specific opinions — not assembled from a template. This means intentional asymmetries (left column scrolls, right doesn't), opinionated defaults (dark mode, warm brown), and personality expressed through material choices rather than decoration.

---

## Color

### Philosophy

Color is environmental, not decorative. It tints the entire atmosphere of the page rather than highlighting individual elements. The accent color washes through the background, the glass surfaces, and the imagery simultaneously — creating a mood, not drawing attention to a component.

### The dual-axis system

Color has two independent dimensions:

- **Appearance** (light / dark / system): Controls the overall luminance and contrast. Dark mode is the default and the "home" state — a warm, low-light environment that lets the content and imagery lead. Light mode inverts the hierarchy but preserves the warmth.
- **Accent** (table / portrait / sky / pizza / vineyard): Controls the hue that tints everything. Each accent is a full environment — a background tone, an associated portrait image, and a derived glass fill color. Changing the accent doesn't just swap a highlight color; it changes what the room feels like.

### The three-tier token architecture

Tokens are organized by what controls them. This is a structural rule, not just an implementation detail — it defines which things feel "ambient" vs "thematic."

1. **Text colors** — change with appearance mode only (light/dark). They are **independent of accent theme**. Switching from table to sky does not change any text color. This means text remains stable and readable as the environment shifts around it.
2. **Background colors** — change with both appearance mode AND accent theme. This is what creates the "room" feeling — each combination of accent + mode produces a distinct atmospheric tone.
3. **Swatch colors** — constant across everything. The accent dot in the picker is always the same color regardless of light/dark mode. These are the "identity" colors for each theme.

> For exact HSL values, see `tokens.md`. The values below describe the design intent; `tokens.md` is the implementation reference.

### Text colors

| Token | Dark Mode | Light Mode | Role |
|-------|-----------|-----------|------|
| `--text-dark` | Near-white (99% L) | Near-black (7% L) | Primary: headings, project link text |
| `--text-medium` | Light gray (90% L) | Dark gray (20% L) | Secondary: coming-soon project cards, muted interactive elements |
| `--text-grey` | Medium gray (75% L) | Medium gray (45% L) | Tertiary: narrative/context paragraphs, about section text |
| `--text-light-grey` | Dark gray (40% L) | Light gray (70% L) | Disabled or deeply muted text |
| `--text-light` | Near-black (7% L) | White (100% L) | Inverse: text on opposite-mode surfaces |
| `--text-link` | Soft blue (81% L) | Medium blue (53% L) | Inline links within body text |
| `--text-underline` | White at 20% alpha | Black at 20% alpha | Barely-visible link underline decoration |

**Design notes:**
- `--text-grey` carries a subtle blue tint (`hue: 240, saturation: 2%`) — not pure gray. This prevents it from feeling "dead" against the warm backgrounds.
- `--text-link` is the only non-neutral text color. Its blue hue (219-220) is distinct from all accent themes, ensuring links are identifiable regardless of the active accent.
- The underline token uses the *opposite* end of the luminance scale at 20% opacity — white-on-dark, black-on-light — keeping the underline barely perceptible in both modes.

### Background colors (per accent + per appearance)

| Accent | Dark Mode | Light Mode | Character |
|--------|-----------|-----------|-----------|
| table | `hsl(33, 18%, 12%)` | `hsl(30, 17%, 91%)` | Warm gold. Default. Grounded, natural, confident. |
| portrait | `hsl(41, 14%, 10%)` | `hsl(39, 15%, 92%)` | Warm ochre. Earthy, slightly warmer than table. |
| sky | `hsl(200, 22%, 8%)` | `hsl(200, 23%, 95%)` | Cool blue. Calm, open, expansive. The counterpoint. |
| pizza | `hsl(8, 22%, 7%)` | `hsl(10, 30%, 96%)` | Warm coral. Playful, human, approachable. |
| vineyard | `hsl(88, 18%, 9%)` | `hsl(86, 18%, 93%)` | Muted green. Natural, grounded, verdant. The cool-warm counterpoint to sky. |

**Pattern:** In dark mode, backgrounds are very dark (L: 7-12%) with low saturation (18-22%). In light mode, backgrounds are near-white (L: 91-96%) with similar saturation. The hue stays roughly the same between modes — the room "dims" rather than changing color. Pizza has the highest light-mode saturation (30%), giving it a slightly more tinted feel.

### Swatch colors (constant across modes)

| Accent | HSL | Character |
|--------|-----|-----------|
| table | `hsl(34, 50%, 60%)` | Warm gold at medium brightness and saturation |
| portrait | `hsl(43, 22%, 62%)` | Muted ochre — the most desaturated swatch |
| sky | `hsl(204, 50%, 70%)` | Soft blue — the lightest swatch |
| pizza | `hsl(15, 53%, 64%)` | Terra cotta — the most saturated swatch |
| vineyard | `hsl(90, 36%, 48%)` | Olive green — mid-saturation, the only cool-warm hybrid |

These are the dots in the accent picker. They don't adapt to appearance mode because they represent the theme's identity — a fixed reference point as the environment shifts.

### Panel chrome (glass configurator)

| Role | Value | Intent |
|------|-------|--------|
| Surface | `#1a1a1a` | Darker than any page background. The panel sits "behind" the page. |
| Border | `#333` | Subtle structural edge. |

Panel colors are hardcoded, not tokenized — the panel is a developer tool, not themed content.

### Contribution heatmap colors

The heatmap uses a 5-level intensity scale (0–4) derived from the active accent hue. Colors are computed inline via `contribFill(level, hue, bgIntensity, isDark)` rather than through CSS custom properties, because fills depend on both the discrete level and the continuous `bgIntensity` slider value at render time.

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `BASE_SAT` | `[10, 40, 45, 50, 55]` | Saturation per level — level 0 is nearly neutral, level 4 is richly chromatic |
| `BASE_ALPHA` | `[0.07, 0.15, 0.35, 0.55, 0.75]` | Opacity per level — level 0 is barely visible, level 4 is prominent |
| `ACCENT_HUES` | `{ table: 34, portrait: 43, sky: 204, pizza: 15, vineyard: 90 }` | Hue per accent theme |

**Dark mode formula**: `hsla(hue, BASE_SAT[level] + t*15, 50 + t*10, BASE_ALPHA[level])` — brighter and more saturated as `bgIntensity` (`t`) increases.

**Light mode formula**: `hsla(hue, BASE_SAT[level] + t*10, 50 - t*15, BASE_ALPHA[level])` — darker and richer as `bgIntensity` increases.

CSS custom properties `--contrib-0` through `--contrib-4` are defined in `theme.css` as reference tokens but are not used by the component (the inline computation is the canonical source).

### What changes per accent, and what doesn't

**Changes**: Background hue/tone, glass fill hue (derived from background via HSL extraction), default portrait image, browser chrome color. The entire atmospheric envelope shifts.

**Stays constant**: All text colors, all structural properties (spacing, radii, shadows), all animation timings, all typography, the glass effect's saturation/brightness/opacity recipe, the interaction model, cursor behavior and morphing rules. The skeleton is permanent; the skin is variable.

### Transition behavior

Theme transitions take `500ms ease-in-out` — slow enough to register as intentional, fast enough to not feel sluggish. Background, imagery, and glass fill all transition simultaneously so the change feels atomic rather than sequenced. The browser meta theme-color updates in sync (with a 10ms remove-and-recreate to defeat browser caching). Text colors do not transition — they snap immediately, since they're subtle enough that a gradual change would look like a rendering glitch rather than an intentional effect.

---

## Typography

### The two-voice system

The site uses a serif/sans pairing — a calculated risk that rewards typographic literacy without calling attention to itself. The pairing should feel inevitable, not decorative: someone who doesn't know fonts thinks "this looks clean," someone who does thinks "they chose well."

Beyond the typeface pairing, the two fonts map to two distinct voices on the page:

- **Serif voice (Literata)** = the author speaking — heading, narrative context, about section. This is Ben's editorial voice: who he is, how he thinks, what he cares about.
- **Sans voice (Onest)** = the work speaking — project links, functional elements. This is navigational: what he built, where to find it.

This split is more meaningful than "serif = big, sans = everything else." The narrative text (section intros, about paragraphs) is functionally closer to the heading than to the project links — it sets context and establishes tone. Giving it the serif voice creates a clear editorial backbone that the sans project links hang from. A visitor reads the serif passages as authored prose, then scans the sans links as action items.

### Typeface roles

- **Headings**: **Literata** (Google Fonts), weight **300**. A contemporary serif designed for screen reading — generous x-height, open counters, soft serifs. At 300 weight, it's light and elegant without feeling fragile. It doesn't announce "I chose a serif" — it just reads well and feels considered. The warmth and modernity signal taste to typographically literate visitors without calling attention to itself.
- **Narrative**: **Literata**, weight **300**. The same serif voice as headings, at a smaller size (22px vs 36px). Differentiated from headings by size and color (`--text-grey` vs `--text-dark`). The shared typeface and weight create a familial connection — the narrative reads as a natural continuation of the heading's voice, not a separate element.
- **Body / links**: **Onest** (Google Fonts), weight **400**. A warm, rounded sans-serif with enough personality to feel authored but not so much that it distracts. The rounded terminals echo Literata's softer curves, creating cohesive warmth across the pairing. At 400 weight, it's grounded enough for sustained reading while staying light.

The weight gap (300 serif / 400 sans) creates hierarchy through contrast rather than emphasis — the serif voice is lighter and more refined, the sans voice is slightly more substantial. Combined with the size scale and color roles, this produces a clear 4-tier typographic hierarchy without any element needing to be bold.

The pairing was chosen to be a "nod to those with an eye for taste" — both fonts are newer, less common choices that a design-literate person would clock as intentional, while someone who doesn't know fonts just thinks "this looks clean."

### Scale

| Element | Font | Size | Line height | Color role |
|---------|------|------|-------------|------------|
| Display (case study hero h1) | Literata | 48px | 1.2 | Heading (high contrast) |
| Title (h1) | Literata | 36px | 1.2 | Heading (high contrast) |
| Section heading (case study h2) | Literata | 24px | 1.2 | Heading (high contrast) |
| Narrative (section intros, about) | Literata | 22px | 1.4 | Tertiary (muted) |
| Project links | Onest | 18px | 1.4 | Heading (high contrast) |
| Meta / captions | Onest | 14px | 1.4 | Grey (low contrast) |

The main page uses a 3-tier scale: 36px heading → 22px narrative → 18px links. The heading is the identity statement, the narrative sets editorial context, and the links are navigational. The 36→22 step (1.64×) is large enough to maintain clear heading dominance. The 22→18 step (1.22×) is subtle — narrative and links are differentiated primarily by font, weight, and color rather than dramatic size contrast. Case study pages extend the scale with a 48px display size for the hero, 24px section headings, and 14px for captions. The full scale follows a roughly 1.2–1.33× progression: 14 → 18 → 22 → 24 → 36 → 48.

### Link treatment

Project links use a subtle underline (`text-decoration-color: rgba(238, 238, 238, 0.2)`) — present enough to signal interactivity, transparent enough to not create visual clutter across 11 links. The arrow `→` is a Unicode character, not an SVG or icon, keeping it typographically integrated. A `4px` gap separates text from arrow.

### What typography does NOT do

- No text-transform (no uppercase labels or small caps)
- No decorative letter-spacing on content text
- No variable sizing for responsive — the scale is fixed (layout adapts, type doesn't)
- No more than two typefaces — the serif/sans pairing is the system; a third font would break coherence
- No weight variation within a role — all headings share one weight, all body text shares one weight

---

## Space & Layout

### The proportional spacing system

Spacing follows a descending hierarchy that mirrors content hierarchy:

| Gap | Where | Why |
|-----|-------|-----|
| 80px | Between main content and footer controls | The footer is structurally separate — a tool, not content. The large gap signals "this is secondary." |
| 64px | Left/right column padding (top) | Structural padding. "Page margin" level. |
| 56px | Between content sections | Between-section separation. Enough to signal a new group, close enough to sustain a narrative throughline. |
| 40px | Between title and first section | Heading-to-content gap. Tighter than between-section to keep the title connected to what follows. |
| 32px | Between narrative text and project cards within a section; between about section paragraphs | Within-section separation. Clearly groups cards under their context paragraph. Also used between about section paragraphs — the 22px serif text needs more air than 24px provided at 18px. |
| 24px | Between project links within a section | Tight enough to read as a group, loose enough that the glass hover effect has room to exist. |
| 8px | Between context paragraphs | Near-zero gap — multiple paragraphs read as a single narrative block. |

### The two-column model

| Column | Width | Behavior | Padding | Role |
|--------|-------|----------|---------|------|
| Left | 50% | Scrolls | 64px top, 40px sides | Content — text, links, controls. Everything you read and interact with. |
| Right | 50% | Fixed | 64px top, 16px sides | Context — imagery that responds to your actions but isn't directly interactive. |

The asymmetry is intentional. The left column has more horizontal padding (40px vs 16px) because text needs breathing room. The right column is tighter because the image fills its space edge-to-edge (with rounded corners providing the visual boundary).

The fixed right column creates a "magazine spread" feel — the image is always present as you scroll, providing ambient context. It also enables the hover-to-swap interaction: the image can respond instantly because it's always in view.

### Responsive behavior

Below 1200px, the right column disappears entirely. It doesn't stack below or collapse — it's simply not part of the mobile experience. This is an opinionated choice: the hover-to-swap interaction doesn't translate to touch, and a stacked image would change the page's character. Better to let the content stand alone than to compromise the interaction model.

### Image container

- Dimensions: `528 x 720px`
- Border radius: `32px`
- Object fit: `cover`

The `32px` radius is the largest radius on the site. It creates a distinctive, recognizable shape — almost a "card" but without borders or shadows. The `cover` fit means images are always full-bleed within this shape, never letterboxed.

### The radius scale

Radii follow a descending scale that maps to element role:

| Radius | Element | Role |
|--------|---------|------|
| 32px | Image container, placeholder visuals | Content showcase — the largest, most prominent shape |
| 16px | Glass hover surface (project cards) | Interactive surface — half of image radius, creating visual kinship |
| 12px | Sidebar glass pill (36px) | Control-level hover surface — concentric with swatches/icons |
| 8px | Mode buttons (40px), inline link glass | Large controls and small interactive surfaces — rounded rectangles |
| 6px | Accent swatches (24px) | Small controls — rounded squares |
| 5px | Sidebar trigger (16px) | Indicator — smallest rounded square, distinct from swatches by both size and proportion |
| 4px | Intensity strip gradient bar | Micro-element — barely rounded, visually reads as a line |

**Shape language:** Rounded squares/rectangles are used for all interactive controls. Circles appear only as cursor elements (the invert disc) and the intensity thumb — never as button shapes. This creates a visual system where shape communicates role: rounded squares = controls, rounded rectangles = surfaces, circles = cursors/indicators. The trigger's smaller size and tighter radius distinguish it from the selectable swatches it anchors.

---

## Surface & Material: The Glass Language

### What "glass" means here

The glass effect is the site's signature interaction. It is not a design system component or a reusable card style — it's a momentary material that appears when you hover a project link, briefly revealing a frosted, subtly luminous surface before disappearing. It communicates: _this is active, this responds to you, and the person who built this cares about details you might not consciously notice._

### Visual anatomy of the glass

The glass is built from layered optical effects, each barely perceptible alone but cohesive together:

**1. Fill** — A theme-derived tint at near-zero opacity.
- The accent background color is parsed to HSL; the hue is extracted.
- Saturation is reduced to `0.1`, brightness set to `0.45` — a desaturated mid-tone version of the accent.
- Applied at `0.05` opacity — functionally invisible, but it connects the surface to the environment.
- **Computation**: `getFillColor(themeColor, saturation=0.1, brightness=0.45, opacity=0.05)` — parse theme background to RGB, convert RGB → HSL, keep hue, replace S and L, convert back to RGB, apply as `rgba(r, g, b, opacity)`.
- **Fallback** (no theme color available): `rgba(gray, gray, gray, opacity)` where `gray = round(brightness * 255)` — a neutral mid-tone.
- **Static fallback tint** (hardcoded in DEFAULTS): `rgba(133, 88, 71, 0.05)` — warm brown, used before the dynamic computation initializes.

**2. Radial highlight** — A top-lit gradient that simulates overhead light hitting curved glass.
```
radial-gradient(
  ellipse 150% 120% at 50% 10%,     /* Wide, shallow ellipse, offset upward */
  rgba(255,255,255, ~0.19),           /* Peak: concentrated highlight near top */
  rgba(255,255,255, ~0.076) at 50%,   /* Midpoint: 40% of peak */
  rgba(255,255,255, ~0.019) at 85%,   /* Fade: 10% of peak */
  transparent at 120%                  /* Overshoot: fully transparent */
)
```
The gradient intensity adapts to the fill brightness: `intensity = 0.15 + brightness * 0.1`. Brighter fills get subtly stronger highlights. The four gradient stops use `intensity`, `intensity * 0.4`, `intensity * 0.1`, and `transparent` — so the peak-to-fade ratio is always 1 : 0.4 : 0.1 regardless of overall brightness.

**3. Backdrop blur** — `blur(1px) saturate(1.2)`. Barely visible. On dark backgrounds with text behind, it creates the faintest frosted-glass depth. The saturation boost prevents the blur from looking "dead."

**4. Inner glow (box-shadow)** — The most critical detail. Six inset shadows simulate light refracting through glass edges:
```
inset 0  1px    0 0  rgba(255,255,255, 0.32)    /* Top edge: brightest */
inset 0 -1px    0 0  rgba(0,  0,  0,   0.12)    /* Bottom edge: shadow */
inset 0  0.1px  0 0  rgba(255,255,255, 0.216)   /* Top hairline */
inset 0.1px  0  0 0  rgba(255,255,255, 0.18)    /* Left hairline */
inset -0.1px 0  0 0  rgba(255,255,255, 0.18)    /* Right hairline */
inset 0 -0.1px 0 0  rgba(255,255,255, 0.144)   /* Bottom hairline */
```
The `0.1px` hairlines are sub-pixel — they won't render as crisp lines on most screens, but they add a collective luminosity around the border that reads as "lit from within."

**Dynamic inner glow formula** (when controlled by the configurator):
- Top highlight: `inset 0 1px 0 0 rgba(255, 255, 255, innerGlow * 0.4)`
- Bottom shadow: `inset 0 -1px 0 0 rgba(0, 0, 0, innerGlow * 0.15)`

The default `innerGlow = 0.8` produces the static values above (0.32 top, 0.12 bottom).

**Dynamic border light simulation** (directional lighting):
```
baseIntensity = 0.12 + fillBrightness * 0.15
top:    rgba(255, 255, 255, baseIntensity * 1.2)   // Lit from above
sides:  rgba(255, 255, 255, baseIntensity * 1.0)   // Neutral
bottom: rgba(255, 255, 255, baseIntensity * 0.8)   // Shadow side
```
Each edge is rendered as an inset shadow at the current `borderWidth` (default 0.1px). This creates the illusion of a light source above the glass — the top edge catches more light, sides are neutral, bottom falls into shadow. The formula scales with fill brightness: darker fills get subtler borders.

**5. Border** — `0.1px solid` with accent-derived color at low opacity. Structurally almost nothing, but it gives the glass a defined edge. Without it, the surface bleeds into the background.

**6. Shape** — `border-radius: 16px`. Half the image container's radius, creating visual kinship without matching it.

**Padding note**: The glass pill itself has `padding: 0` — it sizes to the card element's bounding box. The `24px 16px` padding visible in the layout comes from the **glass highlight's extra padding config** (default 0), not from the link element. The link card's own padding is `8px 12px` (vertical, horizontal). The larger `24px 16px` padding specified in the visual spec refers to the combined effect of the card's content padding plus any glass padding adjustment — in practice, the glass pill wraps the full card element.

### The frost recipe (authoritative, mode-aware)

The glass pill uses a simplified "frost" style — blur + accent tint + thin border, with mode-aware shading. This recipe is shared across all pill implementations (project cards, inline links, sidebar controls):

- **Fill**: `hsla(accent-hue, 20%, 55%, 0.12)` dark / `hsla(accent-hue, 20%, 40%, 0.08)` light
- **Backdrop**: `blur(1px)`
- **Inner glow**: `inset 0 1px 0 0 rgba(255,255,255,0.10)` dark / `inset 0 -1px 0 0 rgba(0,0,0,0.06)` light
- **Border**: `0.5px solid rgba(255,255,255,0.12)` dark / `0.5px solid rgba(0,0,0,0.08)` light

### The glass rules

- Glass appears on hover/focus of **project links**, **inline text links** (Mochi Health, contact links), and **sidebar controls**. It does not exist in resting state.
- Glass uses the **same frost recipe** across all themes — only the accent hue shifts. Opacity, blur, shadow structure are invariant.
- The fill opacity must stay within the frost recipe range. Higher values make it look like a card background rather than a momentary surface.
- The backdrop blur must stay at `1px` or below. Higher values create a heavy frosted-glass look that fights the site's lightness.

### Inline link glass behavior

Inline text links (Mochi Health in the hero, email/LinkedIn/resume in the about section) use the same frost recipe as project cards but with different interaction parameters:

- **Border radius**: `8px` (via `data-border-radius="8"` or container config) — tighter than project cards' `16px`, proportional to the smaller text size.
- **Tight bounds**: Pill clears when the cursor leaves the link, not when it leaves the card stack. Implemented via `data-tight-bounds` (per-card) or `tightBounds: true` (container-level).
- **Lean + tilt**: `maxPull: 3` — subtle directional feedback on small inline targets. Same lean + tilt system as project cards but at lower intensity due to smaller targets.
- **Mochi Health** shares the project card pill container (so the pill can slide from Mochi Health to the first project card and back), but has per-card tight bounds.
- **Contact links** have their own `useGlassHighlight` instance with `cardSelector: '[data-contact-card]'`, completely isolated from the project card pill. Uses `maxPull: 3` for subtle lean + tilt.
- **Back button** (case study pages) has its own `useGlassHighlight` instance with `cardSelector: '[data-back-link]'`, uses `maxPull: 3`.
- **Clear delays**: Project cards 150ms, contact links 300ms, tight-bounds-to-stack transitions 400ms.

### Stacking and DOM structure

- The glass pill is an `aria-hidden="true"` div with `data-glass-highlight="true"`, absolutely positioned inside the link container.
- **Z-index**: pill is `z-index: 10`, link card content is `z-index: 1` with `position: relative`. This ensures the pill renders behind the text — the pill is inserted as the first child of the container, before link elements in DOM order.
- Link cards are identified by the `[data-link-card]` selector, with `data-project-id` for hover state matching.
- Link card layout: `width: max-content`, `align-self: flex-start`, padding `24px 16px`, margin `0 -16px`. Arrow `→` is an inline Unicode character — no flex gap, single continuous underline across text and arrow.
- Coming-soon (non-link) cards: Same `data-link-card` treatment for glass hover, `--text-medium` color, ellipsis `…` at 50% opacity instead of arrow.
- **Glass break zones**: Elements marked with `data-glass-break` suppress the glass pill when the cursor enters them. When `useGlassHighlight` detects a `mouseover` target inside a `[data-glass-break]` element, the pill immediately clears (no `clearDelay`). Use this for non-card interactive content embedded within a glass container — e.g., the contribution heatmap SVG, where the glass pill would otherwise chase the cursor across hundreds of small rects. The `data-glass-break` attribute goes on a wrapper div, not on individual elements.

---

## Motion & Interaction

### Philosophy

Motion on this site serves two purposes: it communicates state changes (something happened) and it expresses material quality (this thing has physical properties). Motion is never decorative or attention-seeking. Every animation should feel like a natural consequence of the user's action — inevitable, not surprising.

### Timing hierarchy

| Duration | Use | Character |
|----------|-----|-----------|
| 50ms | Braille frame interval | Subliminal. Individual frames aren't consciously perceived — the aggregate sweep is. |
| 150ms | Pill clear delay (project cards), sidebar pill fade | Fast enough to feel responsive, long enough to prevent flicker. |
| 200ms | Glass pill appear/disappear, cursor morph debounce, CSS glass hover transition | The site's default action tempo. Responsive but not instant. |
| 250ms | View Transition root crossfade, sidebar close delay | Slightly slower than action tempo — used for transitions that involve layout shifts. |
| 280ms | Left column exit fade, case study exit fade | Content departure. Quick enough to not delay navigation. |
| 300ms | Image cross-fade, braille sweep total (6×50ms), hero image morph, summary text fade, contact link clear delay | Perceptible transition. The user sees the change happening. |
| 350ms | Left column entry fade | Content arrival. Slightly slower than departure — settling in feels more natural than leaving. |
| 400ms | Spring press recovery, sidebar jiggle, tight-bounds-to-stack clear delay | Physical responses. Slow enough to feel like a real material bouncing back. |
| 500ms | Theme/accent transitions, default portrait return, arrow slide-out | Environmental shifts. Slower because the whole atmosphere is changing. |

### The default easing

`cubic-bezier(0.25, 0.46, 0.45, 0.94)` — labeled "Smooth" in the system. This is a deceleration curve that starts moderately fast and settles gently. It avoids the abruptness of `ease-out` and the sluggish start of `ease-in-out`. It's the site's "voice" in motion — measured, confident, unhurried.

### Easing assignments

Each easing curve has a specific role. Don't swap them arbitrarily — the curve should match the physical metaphor:

| Curve | Name | Where used | Physical metaphor |
|-------|------|-----------|-------------------|
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Smooth | Glass hover, sidebar stagger, default CSS transitions | Confident deceleration. An object coming to a natural stop. |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Material | View Transition hero morph | Precise, mechanical. A designed surface sliding into position. |
| `cubic-bezier(0.22, 1, 0.36, 1)` | Quint Out | Arrow slide-out on link click | Flick. Fast start, long gentle coast — like flicking something off a table. |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring | Image click press recovery | Bounce-back. Overshoots target then settles — a physical spring. Only for direct user-initiated press actions. |
| `ease-in-out` | Built-in | Theme transitions (500ms), background color (500ms), sidebar jiggle | Symmetric. Appropriate for environmental shifts where neither start nor end should feel abrupt. |

### Glass pill choreography

**First hover** (appear):
1. Pill is placed instantly at the card's position (no transition — `transition: none`)
2. Pill fades in over 200ms
3. The pill never "flies in" from off-screen. It materializes in place.

**Sliding between cards**:
1. Lerp-based interpolation at 0.12 per frame via `requestAnimationFrame` — creates a smooth "chasing" feel
2. Lean + tilt naturally point toward the target card during transitions, providing directional intent feedback
3. Position, width, and height all interpolate simultaneously

**Exit** (disappear):
1. Pill fades out over 200ms with `ease` easing
2. No position change — it fades where it is
3. **Card stack boundary**: The pill only clears when the cursor leaves the bounds of the card stack — vertically (above the first card or below the last card) or horizontally (past the current card's left/right edges). Moving between cards — even through gaps, context paragraphs, or section breaks — keeps the hover alive. A 150ms delay before clearing softens the exit. Horizontal bounds use the current card's width, not the union of all cards — this prevents a wide card from extending the hover zone of narrower cards.

### Directional feedback: lean + tilt

When the cursor moves toward the edge of a hovered card, the glass pill responds with two subtle CSS transform effects. This replaces the earlier clip-path pentagon deformation system with a simpler, GPU-composited approach that's free of visual artifacts.

**Lean** — The pill translates 3px toward the cursor direction, creating a "drawn toward" feeling.

**Tilt** — The pill rotates up to 1.0° to provide cross-axis positional feedback. When the cursor is in the top-right corner, the top-right corner of the pill visually follows. This communicates spatial awareness beyond simple attraction.

- **Dead zone**: Inner 70% of the card (`deadZone: 0.7`). Cursor in the center of the card produces no lean or tilt. Effect activates in the outer 30%.
- **Pull curve**: `t = 1 - exp(-rawD * 1.5)` — exponential approach from 0 to 1. Smooth onset, asymptotically approaches maximum.
- **Lean formula**: `leanX = dirX * t * maxLean`, `leanY = dirY * t * maxLean` where `maxLean = 3px` and `dir` is the unit vector from card center to cursor.
- **Tilt formula**: `rotateDeg = (cnx * dirY * |dirY| + cny * dirX * |dirX|) * maxTilt * t` — uses `dirY * |dirY|` (preserving sign, squaring magnitude) to ensure symmetric rotation in all quadrants. `cnx`/`cny` are clamped normalized cursor positions.
- **Config**: `maxPull` controls activation. `maxPull: 0` disables lean + tilt entirely (no directional feedback). Any positive value activates lean (3px) + tilt (1.0°).
- **Lerp rate**: 0.12 per frame — creates a "chasing" feel. Animated via `requestAnimationFrame` loop, not CSS transitions.
- **Settle threshold**: 0.3px — when all four dimensions (x, y, width, height) are within 0.3px of target, the loop snaps to exact values and stops.
- **No clip-path**: The pill uses only `transform: translate() rotate()` — no SVG path generation, no clip-path manipulation. This is GPU-composited and never triggers layout or paint.
- **Border + inner glow**: Always applied regardless of `maxPull` value. The simplified transform approach doesn't require oversized clip regions, so the pill's border and inner glow are always visible.

### Image transitions

- **Hover enter**: Default portrait fades out (300ms easeInOut) while project preview fades in (300ms easeInOut). These are concurrent — started by the same state change.
- **Hover exit**: Preview fades out (300ms) while portrait fades back in (500ms). The portrait return is deliberately slower — it creates a gentle "settling" feel rather than an abrupt snap-back.
- **Theme switch**: Portrait cross-fades (500ms easeInOut). Same tempo as the background transition so the whole environment shifts as one.

### What motion does NOT do

- No entrance animations on page load (content is immediately present)
- No scroll-triggered animations or parallax
- No loading spinners or skeleton screens
- No ambient bouncy/springy overshoots (exception: Spring easing is used for direct user-initiated press actions like image click, where overshoot confirms the physical response)
- No motion that continues after the user stops interacting (exception: figpal cursor trailing settles to rest after the cursor stops)
- No motion without a direct cause — every animation traces back to a specific user action (hover, click, drag)

---

## Imagery

### The portrait as environment

The right-column image is not a headshot in the traditional portfolio sense. It's an environmental photograph — cropping varies, context is visible (a bench in fog, a pizza shop at night, a bright sky). The portraits establish mood and place, not just identity.

Each accent theme has an associated portrait that shares its color temperature:
- **table**: A foggy, muted outdoor scene. Greens and browns. Grounded.
- **portrait**: Warm, earthy tones. Similar to table but shifted toward ochre. The most neutral of the four.
- **sky**: Bright daylight, blue sky, sunglasses. Open and expansive.
- **pizza**: Night scene, warm artificial light, neon. Energetic and human.
- **vineyard**: Green, natural outdoor setting. Verdant and grounded.

There are exactly 5 image variants — one per accent theme.

### Theme-to-image mapping

| Accent | Image file | Framer variant (legacy) |
|--------|-----------|------------------------|
| table | `portrait-table.jpeg` | variant1 |
| portrait | `portrait-portrait.jpeg` | variant2 |
| sky | `portrait-sky.jpeg` | variant3 |
| pizza | `portrait-pizza.jpeg` | variant4 |
| vineyard | `portrait-vineyard.jpeg` | — |

In the React implementation, map `accentColor` directly to the image filename.

### Project preview media

Hovering a project link swaps the right-column image to a project-specific preview. Previews can be static images, animated GIFs, or Lottie JSON animations. Each preserves its native aspect ratio — centered in the right column with `object-fit: contain`, no forced container dimensions.

| Project | Format | File | Loop | Notes |
|---------|--------|------|------|-------|
| Screenless TV | GIF | `preview-sony.gif` | Yes (native) | Animated TV concept |
| Eat Local VT | PNG | `preview-acorn.png` | — | Mobile app screenshot |
| CSCW Misinformation | Lottie JSON | `preview-cip.json` | No (plays once) | Fan-in network animation |

**Lottie support**: Projects can specify `lottiePreview` in project data to override the default `projectImageMap` image. Lottie JSON is fetched on hover and rendered via `lottie-react`. The `loop` behavior is per-animation (currently only CSCW uses Lottie, set to play once).

**Shadows for light-background previews**: Previews with white/light backgrounds (eat local PNG, CSCW Lottie) use a subtle `drop-shadow` filter to create separation from the page background. The shadow follows the pixel shape (not the bounding box) and is mode-aware:
- **Dark mode**: `drop-shadow(0 2px 40px rgba(255, 255, 255, 0.1))` — soft white glow
- **Light mode**: `drop-shadow(0 2px 40px rgba(0, 0, 0, 0.08))` — subtle ambient shadow

### Image rules

- Portrait images use `object-fit: cover` with `border-radius: 32px` — they fill the space
- Project previews use `object-fit: contain` — aspect ratio is preserved, centered in the right column
- Images transition via opacity cross-fade only. No scale, no slide, no clip-path reveals.

### Click-to-cycle accent

Clicking the right-column portrait image cycles through accent colors in order (table → portrait → sky → pizza → vineyard → table…). This interaction transforms the passive image area into a playful discovery mechanism:

- **Spring press**: On click, the image scales to `0.985` instantly (no transition), then returns to `1.0` with `transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'` (Spring easing with overshoot). The overshoot creates a subtle "bounce" that makes the click feel physically responsive.
- **Accent cycle**: Dispatches `accent-cycled` custom event, triggering the sidebar jiggle (see **Sidebar jiggle** below). The accent change fires the full environmental shift (background + image + glass + browser chrome).
- **Accessibility**: `tabIndex={0}`, `role="button"`, `aria-label="Cycle accent color"`. Keyboard-operable.

> **Note on the Spring easing**: This is the only intentional overshoot on the site. The anti-pattern "no bouncy/springy overshoots" applies to ambient or continuous animations. A spring press on a direct click action is a deliberate, user-initiated physical response — the overshoot confirms "your action registered" in the same way a physical button springs back.

### Summary text below image

Some projects display a short summary below the preview image on hover:

- **Font**: Literata 300 at 15px (serif voice for editorial description) — or Onest 400 at 14px (sans voice for functional description), toggled via `SUMMARY_FONT` constant (currently: serif)
- **Color**: `var(--text-grey)`, `lineHeight: 1.5`, `maxWidth: 480px`, `padding: 0 24px`
- **Animation**: Delayed fade — 300ms duration, 150ms delay. Appears slightly after the image swap, creating a staggered reveal hierarchy (image first, text second).
- **Layout stability**: A fixed `TEXT_ZONE_HEIGHT = 120px` is always allocated below the image, whether or not summary text is shown. This prevents layout shifts when hovering between projects with and without summaries.
- **Reduced motion**: Instant opacity, no fade.

---

## Interactive Controls

### Mode switcher

Three icon buttons stacked vertically: System (monitor), Light (sun), Dark (moon). Phosphor Icons at **18px** inside a 24×24 span, within 40×40 tap target buttons. `border-radius: 8px` on button, `6px` on icon span. `gap: 6px`.

- Active button: full opacity + 1.5px outline ring on the 24×24 icon span
- Inactive buttons: 0.4 opacity, no outline
- **Selected indicator**: `1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)`, `outlineOffset: 3px` on the icon span. Uses `var(--text-dark)` so it adapts to theme: white @ 20% in dark mode, black @ 20% in light mode. Matches the swatch ring size (30×30 effective area).
- **Hover**: Glass pill (36×36, r=12) slides to the hovered control. Shows on all items including the selected one — hover = spatial feedback, selection = state feedback.
- All transitions: 200ms ease-in-out
- ARIA labels: `"System theme"`, `"Light theme"`, `"Dark theme"`
- Persistence: `localStorage.setItem("appearanceMode", mode)` — key is `"appearanceMode"`, values are `"system" | "light" | "dark"`
- System mode detection: `window.matchMedia("(prefers-color-scheme: dark)").matches`

### Accent picker

Five rounded-square swatches, 24×24px, `border-radius: 6px`. Stacked vertically with `gap: 14px`.

- Each swatch is filled with its accent's swatch color (from `tokens.md` — constant across light/dark)
- Active swatch shows an outline ring: `1.5px solid color-mix(in srgb, <swatch-color> 50%, transparent)` at `outlineOffset: 3px`. Half-opacity of the swatch color keeps the ring subtle but visible.
- **Hover**: Same glass pill as mode switcher (36×36, r=12). Concentric with swatch and outline ring.
- Clicking a swatch triggers the full environmental shift (background + image + glass + browser chrome)

### Control placement — Sidebar

Controls live in a thin sidebar on the right edge of the viewport (`width: 56px`, `position: fixed`). They are tools, not content — deliberately placed outside the main layout where they don't compete with the work.

**Structure:**
- **Trigger** (always visible): A 16×16px rounded square (`border-radius: 5px`) filled with the active accent color. Fixed at `top: 64px`, aligned with the image and heading. The trigger is an indicator, not a selectable control — its distinct shape (smaller, tighter radius) separates it from the swatch options below. Reflects current background intensity via combined glow (box-shadow 0–14px spread) and opacity (0.45–1.0) — atmospheric properties that layer on top of the trigger's identity without altering its shape, size, or color.
- **Expandable toolbar** (visible on hover): Four sections — swatches → intensity strip → appearance modes → cursor modes — separated by dividers. Staggered slide-in from the right (`x: 20 → 0`, 0.22s duration, 0.04s stagger per item). Uses the Smooth easing curve.
- **Four dividers**: Between trigger↔swatches, swatches↔intensity, intensity↔modes, modes↔cursors. All are `width: 20px, height: 1px, var(--text-dark)` at 0.15 opacity, with `margin: 18px 0`. They animate in/out with the toolbar (only the trigger is visible at rest).
- **Hover zone**: The full 56px-wide strip is the hover target, extending to the viewport's right edge. A 250ms close delay prevents flicker when the cursor drifts to the screen edge.
- **Alignment**: The trigger's top edge aligns with the image container's top edge and the heading text's top edge (all at 64px from viewport top).

### Background intensity strip

A draggable vertical gradient strip that controls background color intensity continuously across all themes.

- **Dimensions**: 24px wide hit area, 8px wide visible gradient bar (`border-radius: 4px`), 72px tall
- **Gradient**: `linear-gradient(to bottom, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))` — top is barely tinted, bottom is visibly saturated
- **Thumb**: 11px diameter circle, `var(--swatch)` fill, 1.5px border, subtle drop shadow. Travels the full strip length — flush with top at `t=0` (no tint), flush with bottom at `t=1` (full tint).
- **Interaction**: Click to set level, drag with Pointer Capture for continuous adjustment. `cursor: grab` / `grabbing`. Native drag prevention via `e.preventDefault()` on pointerDown. During drag, direct DOM mutations bypass React renders for zero-lag visual feedback (thumb position, `--bg` CSS variable, trigger glow, meta theme-color); React state is committed on each pointer move for persistence.
- **Keyboard**: Arrow keys step by `0.05` increments. `role="slider"` with `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow={Math.round(t * 100)}`, `aria-valuetext` as a percentage string.
- **Continuous intensity** (`t ∈ [0, 1]`): Background saturation scales from 1.0× to 2.8× via `satMult = 1.0 + 1.8 * t`. Lightness shifts from 0 to -10 in light mode (`-10 * t`) and 0 to +2 in dark mode (`2 * t`). Computed by `computeBg(accent, mode, t)` in ThemeContext. At `t < 0.001`, the `--bg` CSS override is removed and the cascade falls back to the base CSS value. Persisted to localStorage as a float.
- **Named presets** (kept for reference/labeling): Whisper (`t=0`), Subtle (`t=0.33`), Tinted (`t=0.67`), Warm (`t=1`).

### Sidebar glass pill

Each control group (swatches, modes) has its own independent glass pill instance. The pill clears when the cursor leaves a group — hovering the intensity strip between them shows no pill (the strip has its own visual feedback via gradient + thumb + cursor). This matches project card behavior where the pill disappears when leaving the link container.

- **Size**: 36×36px, `border-radius: 12px` — concentric with swatches (24px, r=6) and selection outlines (30px, r≈9)
- **z-index: 10** — sits ON TOP of controls so `backdrop-filter` blurs the content below (swatches, icons). `pointerEvents: none` ensures clicks pass through.
- **Glass recipe**: accent-hued fill at 0.08 opacity, radial highlight, `blur(1px) saturate(1.2)`, inner glow (inset box-shadow), 0.5px accent-tinted border
- **Motion**: RAF lerp at 0.2 speed between controls. Snaps to first hovered control, lerps to subsequent ones. Fades in/out at 150ms.
- **Theme-reactive**: MutationObserver watches `data-accent` and `data-theme` attributes to re-skin the pill on theme change.
- **Lifecycle**: Created when toolbar opens (120ms delay for framer-motion settlement), destroyed when toolbar closes.

### Cursor mode picker

Three icon buttons in the sidebar toolbar, matching the appearance mode layout (40×40 tap targets, gap 6px):

- **Standard** (Phosphor Cursor icon): Default browser cursor. No custom cursor element.
- **Invert** (Phosphor Circle icon): Custom 80×80px white disc with `mix-blend-mode: difference`. Morphs contextually (see **Cursor System** below).
- **Figpal** (figpal.png thumbnail): Trailing companion image (72×72px) that follows the cursor with `LERP_RATE = 0.12` lag.

Active mode: full opacity + outline ring. Inactive: 0.4 opacity. Glass pill shared with appearance modes or isolated per group. Persisted to `localStorage.cursorMode`.

### Sidebar jiggle

When the accent color is cycled (via clicking the portrait image), the sidebar trigger dot plays a horizontal nudge animation:

- **Keyframe**: `0 → -3px → 3px → -2px → 1px → 0` (damped oscillation)
- **Duration**: 400ms, `ease-in-out`
- **Trigger**: Custom DOM event `accent-cycled`, dispatched by `ImageDisplay` on portrait click
- **Implementation**: CSS class `sidebar-jiggle` applied on event, removed on `animationend`

This creates a cause-and-effect pairing: clicking the image shifts the environment (accent cycle) and the sidebar trigger physically reacts — a small moment of delight that connects two otherwise separate interface elements.

### Data visualizations

Embedded data visualizations (e.g., the contribution heatmap) follow these conventions:

- **SVG with `role="img"`** and a descriptive `aria-label` summarizing the data (e.g., total contributions for the year). This gives screen readers the headline without requiring cell-by-cell traversal.
- **Keyboard navigation**: The visualization wrapper is focusable (`tabIndex={0}`) with arrow key navigation through cells. A visible focus ring (2px stroke, `--text-dark`) indicates the current cell. An `aria-live="polite"` region announces the focused cell's data to screen readers.
- **Tooltip**: Positioned absolutely within the container, shown on both mouse hover and keyboard focus. Uses Onest 13px (meta/caption voice), `--bg` background, `--text-light-grey` border.
- **`data-glass-break` wrapper**: Prevents the glass pill from tracking across the visualization's many small elements. See "Stacking and DOM structure" above.
- **Footer row**: Contribution count text (Onest 13px, `--text-grey`) plus a `data-link-card` link to the external profile, with `data-border-radius="8"` for a tighter glass pill radius.

---

## Cursor System

The site offers three cursor modes, each expressing a different interaction personality. The cursor is a first-class design element — not just a pointer, but a communicative surface that morphs to telegraph what will happen before you click.

### The three modes

| Mode | Visual | Character |
|------|--------|-----------|
| Standard | Native browser cursor | Invisible, utilitarian. The site's interactions speak for themselves. |
| Invert | 80×80px theme-tinted disc, `mix-blend-mode: difference` | Bold, graphic. The cursor becomes a lens that inverts everything beneath it, tinted toward the active accent color. |
| Figpal | 72×72px trailing companion image | Playful, personal. A small illustrated character follows the cursor with physics-based lag. |

### Invert mode morphing

The invert cursor is the most expressive mode. It doesn't just track the mouse — it shapeshifts to communicate context:

**Priority hierarchy** (highest wins):

1. **Arrow** (`→` or `←`): When hovering any navigational link (`[data-link-card]`, `[data-contact-card]`, `[data-back-link]`). The disc scales to 0 and a 36px Onest 400 Unicode arrow fades in at full opacity.
   - `→` (right arrow) for forward navigation (project links, external links)
   - `←` (left arrow) for backward navigation (back button on case study pages)
2. **Hand** (Phosphor hand-pointing SVG, 48×48px white): When hovering the right-column theme image (`[data-theme-image]`). The disc scales to 0 and the hand icon fades in — communicating "this is clickable" without a traditional pointer cursor.
3. **Sidebar shrink**: When hovering sidebar controls. The disc shrinks to `scale(0.15)` — a small dot that stays present but doesn't interfere with the compact control surface.
4. **Default disc**: 80×80px white circle at `scale(1)`. The resting state.

**Transitions between states:**
- All morphs use opacity and scale transitions, gated on `prefers-reduced-motion` (instant if reduced motion).
- A 200ms debounce prevents flicker when moving between adjacent project links — the cursor holds its arrow form briefly rather than flickering back to disc and forward to arrow.
- When arrow and hand compete (e.g., hovering a link card positioned over the image), arrow always wins. On card leave, hand restores if the cursor is still over the image.

**Theme tinting**: The invert disc is not pure white — it uses a theme-tinted color derived from `--accent-hue`. Two intensity levels are available via `cursorTintMode` (persisted to `localStorage`):

| Mode | Formula | Character |
|------|---------|-----------|
| `tint-bold` (default) | `hsl(hue, 72%, 78%)` | Noticeable accent warmth in the inversion |
| `tint-subtle` | `hsl(hue, 45%, 88%)` | Faint accent presence, closer to white |

**Mode-aware hue correction**: In dark mode, the disc hue matches the accent directly. In light mode, the hue is shifted by 180° so that `difference` blending against light backgrounds produces accent-adjacent colors rather than complements. The disc color updates live when the accent or appearance mode changes (via MutationObserver on `data-accent` and `data-theme` attributes).

**Global cursor suppression**: In invert mode, a `<style>` tag injects `* { cursor: none !important; }` to suppress all native cursors. This ensures the custom disc is the only cursor visible.

### Figpal mode

A trailing companion image (`/images/figpal.png`, 72×72px) offset 24px right and 24px down from the true cursor position. Uses linear interpolation (`LERP_RATE = 0.12`) per `requestAnimationFrame` for a smooth trailing effect. No `cursor: none` — the native cursor remains visible alongside the companion.

Reduced motion: lerp is skipped (companion snaps to cursor position instantly).

### Braille micro-animation on navigation

When a project link is clicked in invert mode, the cursor arrow doesn't simply disappear — it cycles through 6 Unicode braille characters (U+2800–U+28FF) at 50ms per frame (300ms total), creating a rapid "sweep" animation that visually exhausts before navigation fires.

**The directional sweep frames** (left-to-right):
1. Left column dots fill
2. Both columns partially filled
3. Full 8-dot grid
4. Right column dominant
5. Right column only
6. Empty (U+2800) — the "visual exhale"

The empty final frame is deliberate: it creates a beat of stillness before the page transitions, preventing the animation from feeling abruptly cut off. The braille character set was chosen because it provides structured, grid-based visual progression using pure text — no SVG, no canvas, no image sprites.

In standard/figpal cursor modes, the braille animation is skipped and the inline arrow in the link plays a CSS `arrowSlideOut` keyframe instead (see **Navigation choreography** below).

---

## Iconography & Symbols

### Philosophy

Icons and symbols on this site are functional, not decorative. Every icon either communicates state (which mode is active) or telegraphs action (what will happen on click/hover). There are no illustrative icons, no hero icons, no icon-as-decoration patterns. The icon vocabulary is deliberately small — each symbol earns its place by being the clearest way to communicate its specific meaning.

### The Phosphor system

All UI icons use [Phosphor Icons](https://phosphoricons.com/) at consistent sizing. Phosphor was chosen for its optical consistency (uniform stroke weight, balanced proportions) and its warm, slightly rounded character — it matches Onest's friendly geometry without being cartoonish.

| Icon | Context | Size | Variant |
|------|---------|------|---------|
| Monitor | System appearance mode | 18px | Regular |
| Sun | Light appearance mode | 18px | Regular |
| Moon | Dark appearance mode | 18px | Regular |
| Cursor | Standard cursor mode | 18px | Regular |
| Circle | Invert cursor mode | 18px | Regular |
| HandPointing | Cursor morph over image | 48px | Fill (inline SVG) |

**Sizing rule**: Sidebar control icons are always 18px within 24×24 spans inside 40×40 tap targets. The hand-pointing icon is 48px because it replaces the 80×80 cursor disc — it needs enough visual mass to read as a cursor substitute.

### Unicode symbols

The site uses Unicode characters as typographic elements rather than icon components. This keeps symbols integrated with the text flow — they inherit font properties, respond to text color tokens, and don't require separate asset loading.

| Character | Unicode | Context | Why Unicode |
|-----------|---------|---------|-------------|
| → | U+2192 | Project link suffix, cursor arrow | Typographically integrated with link text. Uses `verticalAlign: text-top` for optical alignment. |
| ← | U+2190 | Back link, cursor back arrow | Same treatment as →, directionally paired. |
| … | U+2026 | Coming-soon project suffix | Communicates incompleteness at 50% opacity — quieter than "Coming soon" text. |
| ⠀–⣿ | U+2800–U+28FF | Braille navigation animation | 8-dot grid enables structured frame-by-frame animation using pure text characters. |

**Arrow as interaction signal**: The `→` character does double duty — in the link text, it signals "this goes somewhere," and in the invert cursor, it signals "you're about to go somewhere." The same symbol in two contexts creates semantic consistency: arrows mean navigation.

### What iconography does NOT do

- No icon-only buttons without labels (sidebar icons have `aria-label` but are always grouped with visual context)
- No animated icons in resting state (icons only animate in response to user action)
- No custom icon set or icon font — Phosphor + Unicode covers all needs
- No color on icons beyond `currentColor` (icons inherit text color, adapting to light/dark mode automatically)

---

## Page Transitions & Navigation

### Philosophy

Page transitions serve the same principle as all motion on this site: they communicate continuity. When you click a project link, the transition should make you feel like you're moving deeper into the same space, not jumping to a different page. The hero image is the visual anchor — it morphs from the homepage position to the case study position, grounding the transition in a shared physical element.

### View Transitions API

Internal navigation uses the browser's View Transitions API (`document.startViewTransition()`) with `flushSync` for synchronous DOM updates. This provides native morphing between the homepage image and the case study hero without JavaScript animation libraries.

| Transition | Duration | Easing | What morphs |
|------------|----------|--------|-------------|
| Root crossfade | 250ms | ease-out (old), ease-in (new) | Page content opacity |
| Hero image morph | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` (Material) | Position, size, border-radius of the project image |

The `viewTransitionName: 'project-hero'` CSS property is applied to project preview images in `ImageDisplay` (not to default portraits or Lottie animations). This means only projects with static image previews get the morphing transition — Lottie projects crossfade normally.

### Navigation choreography

Navigation from the homepage to a case study follows a carefully sequenced timeline:

**Standard/Figpal cursor mode:**
1. **Click** → Arrow `→` plays `arrowSlideOut` keyframe: 0-30% pullback (`translateX(-20%)`), 30-100% accelerate out (`translateX(110%)`, `opacity: 0`). Duration: 500ms, easing: Quint Out (`cubic-bezier(0.22, 1, 0.36, 1)`).
2. **Simultaneously** → Left column content fades out (280ms, 150ms delay via Framer Motion)
3. **After 500ms** → View Transition fires, hero image morphs to case study position
4. **On case study mount** → Content fades in (350ms, 120ms delay)

**Invert cursor mode:**
1. **Click** → Cursor arrow cycles through 6 braille frames (50ms each = 300ms total)
2. **Inline arrow stays static** (cursor handles the visual feedback)
3. **After 300ms** → View Transition fires
4. **Same mount animation** as above

**Reduced motion**: All animations skipped. Navigation is instant.

### Exit and entry animations

**Leaving the homepage:**
- Left column: Framer Motion `opacity: 0`, duration 280ms, delay 150ms
- Right column: hero image held in place for View Transition morphing

**Arriving at a case study:**
- Content: Framer Motion `opacity: 1`, duration 350ms, delay 120ms
- Scroll position: reset to top (`scrollTo(0, 0)`)

**Leaving a case study (back navigation):**
- Full page: opacity fade to 0 over 280ms before View Transition fires
- Same braille or arrow animation as forward navigation, but with `←` direction

### Case study page structure

Case study pages follow a distinct layout from the homepage while sharing the same design vocabulary:

**Navigation:**
- Fixed top bar with `← Back` link, font Onest 18px
- `backdropFilter: blur(4px)` for glassmorphic header
- Glass pill hover with `borderRadius: 8, maxPull: 3, tightBounds: true`

**Edge fades:**
- Fixed 20px gradients at top and bottom edges of viewport
- Gradient from `var(--bg)` to transparent — creates a soft vignette that prevents hard content clipping during scroll

**Three-zone layout — hook → argument → evidence:**

**Wide layout (≥1200px):**
- **Hero (100vh):** Two-column, left: left-aligned title (Literata 48px, weight 300), subtitle (18px), timeline (14px). Right: preview image with `viewTransitionName: 'project-hero'`
- **Body text:** Left-aligned `width: 50%` column (matching hero left panel), 80px top padding below hero. Section headings at 28px weight 300, 48px spacing between sections, 24px between paragraphs.
- **Visual evidence grid:** Full-width 2-column CSS grid with `var(--layout-margin)` padding and 40px gap, 80px spacing above and below. Collects section visuals + gallery items (heroVisual excluded). Odd last item spans both columns. 1 visual = full width. 0 visuals = grid skipped.

**Narrow layout (<1200px):**
- Single column, title at 36px
- Flowing sections with 40px gap (no inline visuals per section)
- Visual evidence stacked below text in single column, 64px top margin

---

## Configurator Panel (Glass Panel)

The glass configurator is a showcase feature — a floating panel that lets visitors tune every parameter of the glass hover effect in real time. It exists to demonstrate craft and to signal that the glass effect isn't a library component; it's a custom, deeply considered system.

### Panel chrome

- Dimensions: 260px wide
- Background: `#1a1a1a` (darker than page surface)
- Border: `1px solid #333`
- Border radius: `14px`
- Shadow: `0 8px 40px rgba(0,0,0,0.5)` (strong depth, the panel floats above the page)
- Uses system sans-serif, not Manrope (it's a dev tool, not page content)
- Typography: uppercase section labels, `letter-spacing: 1px`, tabular numerals for slider values

### Panel behavior

- Toggled by a small "Glass" button near the image area
- 3 tabs: Fill, Shadow, Motion
- Sliders update the glass effect on project links in real time
- "Copy Config" button exports current values as code (blue `#3b82f6`, turns green `#22c55e` on success for 2s)
- State is local to the panel — closing it resets to defaults
- Slider values are click-to-edit (clicking the numeric value opens a text input; Enter commits, Escape cancels)
- Tab transition: `all 120ms ease`
- Active tab: `#2a2a2a` background, `2px solid #3b82f6` bottom border

### Complete default configuration

All values from the glass highlight system. These serve as the starting spec for the React implementation.

**Shape & Fill (Fill tab)**

| Parameter | Default | Range | Step | Description |
|-----------|---------|-------|------|-------------|
| fillSaturation | 0.10 | 0–1 | 0.01 | Color intensity (0 = gray) |
| fillBrightness | 0.45 | 0–1 | 0.01 | Lightness (0 = black, 1 = white) |
| fillOpacity | 0.05 | 0–0.5 | 0.01 | Overall fill opacity |
| surfaceBlur | 1.00 | 0–4 | 0.1 | Backdrop blur in px |
| innerGlow | 0.80 | 0–1 | 0.01 | Inner highlight intensity |
| borderWidth | 0.10 | 0–2 | 0.1 | Glass edge width in px |
| borderRadius | 16 | 0–40 | 1 | Corner radius in px |

**Shadow (Shadow tab)**

| Parameter | Default | Range | Step | Description |
|-----------|---------|-------|------|-------------|
| shadowX | 0 | -20–20 | 1 | Horizontal offset in px |
| shadowY | 0 | -20–20 | 1 | Vertical offset in px |
| shadowBlur | 0 | 0–40 | 1 | Blur radius in px |
| shadowOpacity | 0 | 0–0.3 | 0.01 | Shadow opacity |
| shadowColor | #000000 | — | — | Shadow color (hex) |

**Motion (Motion tab)**

| Parameter | Default | Range | Step | Description |
|-----------|---------|-------|------|-------------|
| duration | 200 | 60–400 | 10 | Slide duration in ms |
| fadeDuration | 200 | 0–300 | 10 | Appear/disappear fade in ms |
| easing | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | — | — | Slide easing curve ("Smooth") |
| stretchAmount | 0.05 | 0–1 | 0.01 | Deformation in movement direction |
| squashAmount | 0.001 | 0–0.5 | 0.001 | Perpendicular compression |
| overshoot | 0.05 | 0–1 | 0.01 | Bounce past target (0 = none) |
| recoveryDuration | 150 | — | — | Deformation recovery in ms |
| pullStrength | 0.12 | 0–1 | 0.01 | Edge gravitational pull intensity |
| edgeZone | 0.20 | 0.1–1 | 0.05 | Responsive area (1 = entire card) |
| pullLerp | 0.12 | — | — | Pull animation smoothing speed |

### Easing curve presets

Named curves available for reference and potential use in the configurator:

| Name | Value | Character |
|------|-------|-----------|
| Smooth | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Default. Measured deceleration. |
| Material | `cubic-bezier(0.4, 0, 0.2, 1)` | Google Material standard. |
| Expo Out | `cubic-bezier(0.16, 1, 0.3, 1)` | Fast start, very gentle settle. |
| Quint Out | `cubic-bezier(0.22, 1, 0.36, 1)` | Similar to Expo but slightly less aggressive. |
| Snap | `cubic-bezier(0.2, 0, 0, 1)` | Fast start for pull release. |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoots target. |

The panel's visual language (dark surface, system font, blue accent, technical labels) is deliberately different from the page's language. It reads as a tool or inspector, not as page content.

---

## Anti-Patterns

Things this site deliberately avoids. If you find yourself reaching for any of these, reconsider.

| Don't | Why |
|-------|-----|
| Add a third typeface | The serif/sans pairing is the system. A third font breaks coherence and signals indecision. |
| Vary weight within a role | All headings share one weight, all body shares one weight. Weight contrast is between roles, not within them. |
| Use weight for emphasis within text | Bold words or phrases within body text fight the clean, even texture. Structure and color create emphasis. |
| Add drop shadows to cards or containers | The only shadow is the inner glow on the glass effect and the panel shadow. Shadows imply elevation, and this site is flat. |
| Use color to highlight individual elements | Color is environmental (background tint), not component-level (colored buttons/badges). |
| Add borders to section dividers | Sections are separated by space alone. Lines or borders add visual noise. |
| Animate on scroll | Content is static. Only user-initiated actions (hover, click) trigger motion. |
| Add loading states or skeleton screens | The site is small enough to load instantly. Skeleton screens imply enterprise scale, not personal craft. |
| Use a card metaphor for project links | Links are text, not cards. The glass effect is momentary, not a resting surface. |
| Stack the right column below content on mobile | The interaction model doesn't translate to touch. Remove it entirely rather than degrading it. |
| Add hover underlines or color changes to project card links | The glass effect IS the hover state for project cards. Inline text links (Mochi Health, contact links) use a persistent subtle underline (`--text-underline`) for in-context readability, but project cards should not. |
| Use transition durations outside the timing hierarchy | 150 / 200 / 300 / 500ms. Pick the one that matches the action's weight. |
| Mix easing curves arbitrarily | Use the Smooth curve (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) as default. Only deviate for specific physical behaviors (snap-back, overshoot). See **Easing assignments** for the role of each curve. |
| Add custom icons beyond Phosphor + Unicode | The icon vocabulary is deliberately minimal. Every icon earns its place. A new icon should only be added if no existing Phosphor icon or Unicode symbol communicates the meaning. |
| Use cursor changes for decoration | Cursor morphing communicates function (arrow = navigation, hand = clickable, shrink = control zone). Never morph the cursor for aesthetic effect without a functional reason. |
| Add page transitions with JavaScript animation libraries | View Transitions API handles page morphs natively. Don't add GSAP, anime.js, or similar for page-level transitions. Framer Motion is for component-level orchestration only. |
| Create separate hover states for mobile | Touch interactions are fundamentally different. Don't simulate hover with touch-and-hold or first-tap-reveals. Either the interaction translates naturally to touch (tap) or it's removed (glass pill, image swap). |
| Be loud without purpose | Standing out is a goal, but every bold choice must reward closer inspection rather than demand attention. |

---

## Coherence Checklist

When implementing or modifying any part of the site, verify:

**Typography & Color:**
- [ ] Does it use the correct typeface for its voice (Literata for headings + narrative, Onest for links + body)?
- [ ] Does it use the correct weight for its role (300 for serif, 400 for sans — no variation within a role)?
- [ ] Do text colors use appearance-only tokens (`--text-*`), not theme-dependent values?
- [ ] Do background colors use the correct theme+appearance combination from `tokens.md`?
- [ ] Does color come from CSS custom properties, not hardcoded values?
- [ ] Is the element visually identical across all five accent themes (with only hue shifting)?
- [ ] Would this element make sense in both light and dark mode?

**Layout & Shape:**
- [ ] Does it use the spacing hierarchy (80/64/56/40/32/24/8)?
- [ ] Does the border-radius come from the radius scale (32 / 16 / 12 / 8 / 6 / 5)?

**Motion & Interaction:**
- [ ] Does any animation use a duration from the timing hierarchy (50/150/200/250/280/300/350/400/500ms)?
- [ ] Is the easing curve appropriate for the physical metaphor? (See **Easing assignments**)
- [ ] Does the cursor morph appropriately for the element type? (arrow for links, hand for clickable images, shrink for controls)
- [ ] Does the interaction respect `prefers-reduced-motion: reduce`?
- [ ] If this is a navigable link, does it have the correct `data-*` attribute for cursor detection?

**Craft & Intentionality:**
- [ ] Is this choice intentional? Does it reward closer inspection or just add noise?
- [ ] Does a new interactive element have glass pill hover treatment where appropriate?
- [ ] If adding a new icon, is it from Phosphor Icons? Is it the right size (18px for controls, 48px for cursor)?
