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
- **Accent** (table / portrait / sky / pizza): Controls the hue that tints everything. Each accent is a full environment — a background tone, an associated portrait image, and a derived glass fill color. Changing the accent doesn't just swap a highlight color; it changes what the room feels like.

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
| `--text-medium` | Light gray (90% L) | Dark gray (20% L) | Secondary: body paragraphs, descriptions |
| `--text-grey` | Medium gray (75% L) | Medium gray (45% L) | Tertiary: captions, de-emphasized content |
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
| portrait | `hsl(47, 18%, 10%)` | `hsl(42, 22%, 91%)` | Warm ochre. Earthy, slightly warmer than table. |
| sky | `hsl(200, 22%, 8%)` | `hsl(200, 23%, 95%)` | Cool blue. Calm, open, expansive. The counterpoint. |
| pizza | `hsl(8, 22%, 7%)` | `hsl(10, 30%, 96%)` | Warm coral. Playful, human, approachable. |

**Pattern:** In dark mode, backgrounds are very dark (L: 7-12%) with low saturation (18-22%). In light mode, backgrounds are near-white (L: 91-96%) with similar saturation. The hue stays roughly the same between modes — the room "dims" rather than changing color. Pizza has the highest light-mode saturation (30%), giving it a slightly more tinted feel.

### Swatch colors (constant across modes)

| Accent | HSL | Character |
|--------|-----|-----------|
| table | `hsl(34, 50%, 60%)` | Warm gold at medium brightness and saturation |
| portrait | `hsl(47, 34%, 64%)` | Muted ochre — the most desaturated swatch |
| sky | `hsl(204, 50%, 70%)` | Soft blue — the lightest swatch |
| pizza | `hsl(15, 53%, 64%)` | Terra cotta — the most saturated swatch |

These are the dots in the accent picker. They don't adapt to appearance mode because they represent the theme's identity — a fixed reference point as the environment shifts.

### Panel chrome (glass configurator)

| Role | Value | Intent |
|------|-------|--------|
| Surface | `#1a1a1a` | Darker than any page background. The panel sits "behind" the page. |
| Border | `#333` | Subtle structural edge. |

Panel colors are hardcoded, not tokenized — the panel is a developer tool, not themed content.

### What changes per accent, and what doesn't

**Changes**: Background hue/tone, glass fill hue (derived from background via HSL extraction), default portrait image, browser chrome color. The entire atmospheric envelope shifts.

**Stays constant**: All text colors, all structural properties (spacing, radii, shadows), all animation timings, all typography, the glass effect's saturation/brightness/opacity recipe, the interaction model. The skeleton is permanent; the skin is variable.

### Transition behavior

Theme transitions take `500ms ease-in-out` — slow enough to register as intentional, fast enough to not feel sluggish. Background, imagery, and glass fill all transition simultaneously so the change feels atomic rather than sequenced. The browser meta theme-color updates in sync (with a 10ms remove-and-recreate to defeat browser caching). Text colors do not transition — they snap immediately, since they're subtle enough that a gradual change would look like a rendering glitch rather than an intentional effect.

---

## Typography

### The typographic pairing

The site uses a serif/sans pairing — a calculated risk that rewards typographic literacy without calling attention to itself. The pairing should feel inevitable, not decorative: someone who doesn't know fonts thinks "this looks clean," someone who does thinks "they chose well."

- **Headings**: **Literata** (Google Fonts), weight **300**. A contemporary serif designed for screen reading — generous x-height, open counters, soft serifs. At 300 weight, it's light and elegant without feeling fragile. It doesn't announce "I chose a serif" — it just reads well and feels considered. The warmth and modernity signal taste to typographically literate visitors without calling attention to itself.
- **Body**: **Onest** (Google Fonts), weight **400**. A warm, rounded sans-serif with enough personality to feel authored but not so much that it distracts. The rounded terminals echo Literata's softer curves, creating cohesive warmth across the pairing. At 400 weight, it's grounded enough for sustained reading while staying light.

The 100-step weight gap (300 heading / 400 body) creates hierarchy through contrast rather than emphasis — the heading is lighter and more refined, the body is slightly more substantial. Combined with the serif/sans distinction and the size scale, this produces clear typographic hierarchy without either element needing to be bold.

The pairing was chosen to be a "nod to those with an eye for taste" — both fonts are newer, less common choices that a design-literate person would clock as intentional, while someone who doesn't know fonts just thinks "this looks clean."

### Scale

| Element | Size | Line height | Color role |
|---------|------|-------------|------------|
| Display (case study hero h1) | 48px | 1.2 | Heading (high contrast) |
| Title (h1) | 36px | 1.2 | Heading (high contrast) |
| Section heading (case study h2) | 24px | 1.2 | Heading (high contrast) |
| Body / descriptions | 18px | 1.2 | Body (muted) |
| Project links | 18px | 1.4 | Heading (high contrast) |
| Meta / captions | 14px | 1.4 | Grey (low contrast) |

The main page scale is deliberately tight — only two sizes (36/18). The title is 2x the body, which is a clean ratio. Case study pages extend the scale with a 48px display size for the hero, 24px section headings for scannability, and 14px for captions and metadata. The full scale follows a roughly 1.33× progression: 14 → 18 → 24 → 36 → 48. Project links share the body size but use heading color and taller line-height, differentiating them through color and rhythm rather than scale.

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
| 64px | Between title and first section; left/right column padding (top) | Major structural breaks. "New topic" level. |
| 40px | Between content sections | Within-topic separation. Enough to breathe, not enough to lose continuity. |
| 24px | Between project links within a section | Tight enough to read as a group, loose enough that the glass hover effect has room to exist. |

This 80 → 64 → 40 → 24 progression is not arbitrary. Each step is roughly 60-65% of the previous, creating a consistent visual rhythm. Deviating from these values — even by 8px — breaks the proportional relationship.

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
| 32px | Image container | Content showcase — the largest, most prominent shape |
| 16px | Glass hover surface | Interactive surface — half of image radius, creating visual kinship |
| 8px | Mode buttons (40px) | Large controls — rounded rectangles |
| 6px | Accent swatches (24px) | Small controls — rounded squares |
| 5px | Sidebar trigger (16px) | Indicator — smallest rounded square, distinct from swatches by both size and proportion |

**Shape language:** Rounded squares/rectangles are used for all interactive controls. Circles are not used. This creates a visual system where shape communicates role: rounded squares = controls, rounded rectangles = surfaces. The trigger's smaller size and tighter radius distinguish it from the selectable swatches it anchors.

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

### The glass rules

- Glass appears **only** on hover/focus of project links. It does not exist in resting state.
- Glass uses the **same recipe** across all themes — only the hue shifts. Opacity, blur, shadow structure, and radii are invariant.
- Glass **never** appears on elements that aren't project links. It is not a general-purpose surface treatment.
- The fill opacity must stay at or below `0.05`. Higher values make it look like a card background rather than a momentary surface.
- The backdrop blur must stay at `1px` or below. Higher values create a heavy frosted-glass look that fights the site's lightness.

### Stacking and DOM structure

- The glass pill is an `aria-hidden="true"` div with `data-glass-highlight="true"`, absolutely positioned inside the link container.
- **Z-index**: pill is `z-index: 10`, link card content is `z-index: 1` with `position: relative`. This ensures the pill renders behind the text — the pill is inserted as the first child of the container, before link elements in DOM order.
- Link cards are identified by the `[data-link-card]` selector, with `data-project-id` for hover state matching.
- Link card layout: `display: flex`, `align-items: center`, `gap: 4px`, padding `8px 12px` (vertical, horizontal).
- Arrow character `→` in a `flex-shrink: 0` span, same font size as link text.

---

## Motion & Interaction

### Philosophy

Motion on this site serves two purposes: it communicates state changes (something happened) and it expresses material quality (this thing has physical properties). Motion is never decorative or attention-seeking. Every animation should feel like a natural consequence of the user's action — inevitable, not surprising.

### Timing hierarchy

| Duration | Use | Character |
|----------|-----|-----------|
| 150ms | Recovery from deformation, pull snap-back | Fast enough to feel "spring-like" |
| 200ms | Glass pill appear/disappear, card-to-card slide | The site's default action tempo. Responsive but not instant. |
| 300ms | Image cross-fade (both hover preview and glass hover CSS) | Perceptible transition. The user sees the change happening. |
| 500ms | Theme/accent transitions, default portrait return | Environmental shifts. Slower because the whole atmosphere is changing. |

### The default easing

`cubic-bezier(0.25, 0.46, 0.45, 0.94)` — labeled "Smooth" in the system. This is a deceleration curve that starts moderately fast and settles gently. It avoids the abruptness of `ease-out` and the sluggish start of `ease-in-out`. It's the site's "voice" in motion — measured, confident, unhurried.

### Glass pill choreography

**First hover** (appear):
1. Pill is placed instantly at the card's position (no transition — `transition: none`)
2. Pill fades in over 200ms
3. The pill never "flies in" from off-screen. It materializes in place.

**Sliding between cards**:
1. CSS transition on `transform`, `width`, `height` — 200ms, Smooth easing
2. If `overshoot > 0`: easing becomes `cubic-bezier(0.34, [1 + overshoot], 0.64, 1)` — a subtle bounce past the target
3. Simultaneously: stretch/squash deformation via Web Animation API (350ms total = `duration + recoveryDuration`, ease-out)
   - 3 keyframes at offsets 0, 0.3, 1: `scale(1,1)` → `scale(peakSx, peakSy)` → `scale(1,1)`
   - Peak deformation at 30% of the timeline, then recovery to normal
   - Deformation formula:
     ```
     f = min(distance / 150, 1)        // Normalize by distance (caps at 150px)
     hr = abs(dx) / distance            // Horizontal ratio of movement
     vr = abs(dy) / distance            // Vertical ratio of movement
     peakSx = (1 + stretchAmount * f * hr) * (1 - squashAmount * f * vr)
     peakSy = (1 + stretchAmount * f * vr) * (1 - squashAmount * f * hr)
     ```
   - Stretch is applied in the direction of movement, squash perpendicular
   - Squash is deliberately subtle (`squashAmount: 0.003`) — barely perceptible, just enough to sell the physical metaphor without looking rubbery
   - Only triggered when `distance > 5px` (prevents micro-jitter deformations)

**Exit** (disappear):
1. Pill fades out over 200ms with `ease` easing
2. No position change — it fades where it is
3. **Card stack boundary**: The pill only clears when the cursor leaves the vertical bounds of the card stack (above the first card or below the last card). Moving between cards — even through gaps, context paragraphs, or section breaks — keeps the hover alive. A 150ms delay before clearing softens the exit.

### Gravitational pull

When the cursor drifts toward the edge of a hovered card, the glass pill stretches and shifts toward that edge, as if drawn toward the neighboring card. This is the site's most physically expressive behavior.

- **Activation zone**: Outer 20% (`edgeZone: 0.2`) of the card. Cursor position within the card is computed as a 0–1 ratio; if `ratio > 1 - edgeZone` → pulling toward bottom/right; if `ratio < edgeZone` → pulling toward top/left.
- **Ramp curve**: `t = pow(clamp(t, 0, 1), 1.5)` — imperceptible near the boundary, strong near the edge
- **Max stretch/translate formulas**:
  ```
  maxStretch = dimension * 0.25 * pullStrength
  maxMove    = dimension * 0.15 * pullStrength
  stretchPx  = t * maxStretch
  movePx     = t * maxMove
  ```
  Where `dimension` is the card's height (vertical layout) or width (horizontal layout).
- **Volume preservation**: `newWidth = baseWidth * (baseHeight / newHeight)` — as the pill stretches taller, it narrows proportionally. The inverse applies for horizontal stretching.
- **Layout detection**: Vertical vs horizontal is determined by comparing the first two `[data-link-card]` elements — if `abs(b.top - a.top) > abs(b.left - a.left)`, it's vertical.
- **Lerp rate**: 0.12 per frame — creates a "chasing" feel where the pill accelerates into the pull and decelerates as it approaches. Animated via `requestAnimationFrame` loop, not CSS transitions.
- **Settle threshold**: 0.3px — when all four dimensions (x, y, width, height) are within 0.3px of target, the loop snaps to exact values and stops.

### Image transitions

- **Hover enter**: Default portrait fades out (300ms easeInOut) while project preview fades in (300ms easeInOut). These are concurrent — started by the same state change.
- **Hover exit**: Preview fades out (300ms) while portrait fades back in (500ms). The portrait return is deliberately slower — it creates a gentle "settling" feel rather than an abrupt snap-back.
- **Theme switch**: Portrait cross-fades (500ms easeInOut). Same tempo as the background transition so the whole environment shifts as one.

### What motion does NOT do

- No entrance animations on page load (content is immediately present)
- No scroll-triggered animations or parallax
- No loading spinners or skeleton screens
- No bouncy/springy overshoots beyond the subtle 0.05 overshoot on pill slides
- No motion that continues after the user stops interacting

---

## Imagery

### The portrait as environment

The right-column image is not a headshot in the traditional portfolio sense. It's an environmental photograph — cropping varies, context is visible (a bench in fog, a pizza shop at night, a bright sky). The portraits establish mood and place, not just identity.

Each accent theme has an associated portrait that shares its color temperature:
- **table**: A foggy, muted outdoor scene. Greens and browns. Grounded.
- **portrait**: Warm, earthy tones. Similar to table but shifted toward ochre. The most neutral of the four.
- **sky**: Bright daylight, blue sky, sunglasses. Open and expansive.
- **pizza**: Night scene, warm artificial light, neon. Energetic and human.

There are exactly 4 image variants — one per accent theme. (The original Framer component had a vestigial 5th variant slot; it is not used.)

### Theme-to-image mapping

| Accent | Image file | Framer variant (legacy) |
|--------|-----------|------------------------|
| table | `portrait-table.jpeg` | variant1 |
| portrait | `portrait-portrait.jpeg` | variant2 |
| sky | `portrait-sky.jpeg` | variant3 |
| pizza | `portrait-pizza.jpeg` | variant4 |

In the React implementation, map `accentColor` directly to the image filename. The Framer variant numbering is preserved here only for reference.

### Image rules

- All images use the same container: `528 x 720px`, `border-radius: 32px`, `object-fit: cover`
- Images fill the container completely — no letterboxing, no padding, no borders
- The rounded corners are the only "frame" — there is no drop shadow, no border, no card surface behind the image
- Project preview images (shown on hover) should share the same aspect ratio and cropping approach
- Images transition via opacity cross-fade only. No scale, no slide, no clip-path reveals.

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

Four rounded-square swatches, 24×24px, `border-radius: 6px`. Stacked vertically with `gap: 14px`.

- Each swatch is filled with its accent's swatch color (from `tokens.md` — constant across light/dark)
- Active swatch shows an outline ring: `1.5px solid color-mix(in srgb, <swatch-color> 50%, transparent)` at `outlineOffset: 3px`. Half-opacity of the swatch color keeps the ring subtle but visible.
- **Hover**: Same glass pill as mode switcher (36×36, r=12). Concentric with swatch and outline ring.
- Clicking a swatch triggers the full environmental shift (background + image + glass + browser chrome)

### Control placement — Sidebar

Controls live in a thin sidebar on the right edge of the viewport (`width: 56px`, `position: fixed`). They are tools, not content — deliberately placed outside the main layout where they don't compete with the work.

**Structure:**
- **Trigger** (always visible): A 16×16px rounded square (`border-radius: 5px`) filled with the active accent color. Fixed at `top: 64px`, aligned with the image and heading. The trigger is an indicator, not a selectable control — its distinct shape (smaller, tighter radius) separates it from the swatch options below. Reflects current background intensity via combined glow (box-shadow 0–14px spread) and opacity (0.45–1.0) — atmospheric properties that layer on top of the trigger's identity without altering its shape, size, or color.
- **Expandable toolbar** (visible on hover): Three sections — swatches → intensity strip → mode icons — separated by dividers. Staggered slide-in from the right (`x: 20 → 0`, 0.22s duration, 0.04s stagger per item). Uses the Smooth easing curve.
- **Three dividers**: Between trigger↔swatches, swatches↔intensity, intensity↔modes. All are `width: 20px, height: 1px, var(--text-dark)` at 0.15 opacity, with `margin: 18px 0`. They animate in/out with the toolbar (only the trigger is visible at rest).
- **Hover zone**: The full 56px-wide strip is the hover target, extending to the viewport's right edge. A 250ms close delay prevents flicker when the cursor drifts to the screen edge.
- **Alignment**: The trigger's top edge aligns with the image container's top edge and the heading text's top edge (all at 64px from viewport top).

### Background intensity strip

A draggable vertical gradient strip that controls background color intensity across all themes.

- **Dimensions**: 24px wide hit area, 8px wide visible gradient bar (`border-radius: 4px`), 72px tall
- **Gradient**: `linear-gradient(to bottom, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))` — top is barely tinted, bottom is visibly saturated
- **Thumb**: 11px diameter circle, `var(--swatch)` fill, 1.5px border, subtle drop shadow. Travels the full strip length — flush with top at intensity 0, flush with bottom at intensity 3 (Warm).
- **Interaction**: Click to set level, drag with Pointer Capture for continuous adjustment. `cursor: grab` / `grabbing`. Native drag prevention via `e.preventDefault()` on pointerDown.
- **Keyboard**: Arrow keys step through levels. `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`.
- **4 intensity levels**: Whisper (baseline), Subtle, Tinted, Warm. Each scales background saturation (1.0×–2.8×) and shifts lightness (light mode: 0 to -10; dark mode: 0 to +2). Persisted to localStorage.

### Sidebar glass pill

Each control group (swatches, modes) has its own independent glass pill instance. The pill clears when the cursor leaves a group — hovering the intensity strip between them shows no pill (the strip has its own visual feedback via gradient + thumb + cursor). This matches project card behavior where the pill disappears when leaving the link container.

- **Size**: 36×36px, `border-radius: 12px` — concentric with swatches (24px, r=6) and selection outlines (30px, r≈9)
- **z-index: 10** — sits ON TOP of controls so `backdrop-filter` blurs the content below (swatches, icons). `pointerEvents: none` ensures clicks pass through.
- **Glass recipe**: accent-hued fill at 0.08 opacity, radial highlight, `blur(1px) saturate(1.2)`, inner glow (inset box-shadow), 0.5px accent-tinted border
- **Motion**: RAF lerp at 0.2 speed between controls. Snaps to first hovered control, lerps to subsequent ones. Fades in/out at 150ms.
- **Theme-reactive**: MutationObserver watches `data-accent` and `data-theme` attributes to re-skin the pill on theme change.
- **Lifecycle**: Created when toolbar opens (120ms delay for framer-motion settlement), destroyed when toolbar closes.

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
| squashAmount | 0.003 | 0–0.5 | 0.001 | Perpendicular compression |
| overshoot | 0.05 | 0–1 | 0.01 | Bounce past target (0 = none) |
| recoveryDuration | 150 | — | — | Deformation recovery in ms |
| pullStrength | 0.25 | 0–1 | 0.01 | Edge gravitational pull intensity |
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
| Add hover underlines or color changes to links | The glass effect IS the hover state. No additional text-level hover treatment needed. |
| Use transition durations outside the timing hierarchy | 150 / 200 / 300 / 500ms. Pick the one that matches the action's weight. |
| Mix easing curves arbitrarily | Use the Smooth curve (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) as default. Only deviate for specific physical behaviors (snap-back, overshoot). |
| Be loud without purpose | Standing out is a goal, but every bold choice must reward closer inspection rather than demand attention. |

---

## Coherence Checklist

When implementing or modifying any part of the site, verify:

- [ ] Does it use the correct typeface for its role (serif for headings, sans for body)?
- [ ] Does it use the correct weight for its role (no weight variation within a role)?
- [ ] Does it use the spacing hierarchy (80/64/40/24)?
- [ ] Does the border-radius come from the radius scale (32 / 16 / 8 / 6 / 5)?
- [ ] Does color come from CSS custom properties, not hardcoded values?
- [ ] Do text colors use appearance-only tokens (`--text-*`), not theme-dependent values?
- [ ] Do background colors use the correct theme+appearance combination from `tokens.md`?
- [ ] Is the element visually identical across all four accent themes (with only hue shifting)?
- [ ] Does any animation use one of the four timing tiers (150/200/300/500ms)?
- [ ] Does the Smooth easing curve feel right, or does this interaction need a specific curve?
- [ ] Would this element make sense in both light and dark mode?
- [ ] Is this choice intentional? Does it reward closer inspection or just add noise?
