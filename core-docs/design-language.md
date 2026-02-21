# Design Language

The visual and interaction rules that govern every detail of the site. This document is the source of truth for how things should look, feel, and behave — not just what values to use, but why. Reference this before making any design or implementation decision.

---

## Core Principles

### 1. Restraint as signal

Every element on the site earns its place. There is one typeface at one weight. There is generous whitespace. There are no decorative elements, no gradients-for-gradients'-sake, no badges or flourishes. The restraint itself communicates: this person edits, curates, and knows what to leave out. When a visitor sees this level of discipline, they infer the same discipline in the work.

### 2. The site is the portfolio piece

Before anyone reads a word or clicks a link, the site has already made its case. The quality of the typography, the feel of the hover interactions, the cohesion across themes — these are the first evidence of taste. Implementation craft is not behind-the-scenes infrastructure; it _is_ the portfolio.

### 3. Quiet confidence over spectacle

Nothing shouts. The glass effect is barely-there until you notice it. The image cross-fades are smooth but unhurried. The theme switching is ambient. The whole experience says "I don't need to impress you" — which is, itself, impressive. The closer to nelson.co than to Dribbble.

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

### Dark mode (default)

| Role | Value | Intent |
|------|-------|--------|
| Background | `rgb(36, 31, 25)` | Warm dark brown, not cold gray. Feels like a lit room at night, not a terminal. |
| Heading text | `rgb(252, 252, 252)` | Near-white. High contrast against the warm background. |
| Body text | `rgb(190, 190, 193)` | Muted gray. Clearly secondary to headings without being hard to read. |
| Link underline | `rgba(238, 238, 238, 0.2)` | Barely visible. Signals "this is a link" without visual noise. |
| Panel surface | `rgb(26, 26, 26)` | Darker than the background. Surfaces sit behind the page, not on top of it. |
| Panel border | `rgb(51, 51, 51)` | Subtle structural edge. Defines without decorating. |

### Light mode

| Role | Value | Intent |
|------|-------|--------|
| Background | `rgb(236, 232, 228)` | Warm cream, not clinical white. Same warmth as dark mode, inverted. |
| Heading text | `rgb(17, 17, 17)` | Near-black. |
| Body text | `rgb(112, 112, 117)` | Medium gray. Same relative contrast relationship as dark mode. |

### Accent colors

| Name | RGB | Character |
|------|-----|-----------|
| table | `rgb(194, 180, 130)` | Warm gold. Default. Grounded, natural, confident. |
| portrait | TBD | Similar warm tone, subtly distinct. |
| sky | `rgb(140, 186, 217)` | Cool blue. Calm, open, expansive. The counterpoint. |
| pizza | `rgb(212, 139, 115)` | Warm coral/terra cotta. Playful, human, approachable. |

### What changes per accent, and what doesn't

**Changes**: Background hue, glass fill hue (derived from background via HSL extraction), default portrait image, browser chrome color. The entire atmospheric envelope shifts.

**Stays constant**: All structural properties (spacing, radii, shadows), all animation timings, all typography, the glass effect's saturation/brightness/opacity recipe, the interaction model. The skeleton is permanent; the skin is variable.

### Transition behavior

Theme transitions take `500ms ease-in-out` — slow enough to register as intentional, fast enough to not feel sluggish. Background, imagery, and glass fill all transition simultaneously so the change feels atomic rather than sequenced. The browser meta theme-color updates in sync (with a 10ms remove-and-recreate to defeat browser caching).

---

## Typography

### The single-typeface rule

**Manrope**, weight 400, everywhere. No bold. No italic. No second typeface. Hierarchy is established entirely through size, color, and space — never through weight variation. This constraint forces the layout to do the work, which produces the clean, structurally confident feel the site needs.

### Scale

| Element | Size | Line height | Color role |
|---------|------|-------------|------------|
| Title (h1) | 36px | 1.2 | Heading (high contrast) |
| Body / descriptions | 18px | 1.2 | Body (muted) |
| Project links | 18px | 1.4 | Heading (high contrast) |

The scale is deliberately tight — only two sizes. The title is 2x the body, which is a clean ratio. Project links share the body size but use heading color and taller line-height, differentiating them through color and rhythm rather than scale.

### Link treatment

Project links use a subtle underline (`text-decoration-color: rgba(238, 238, 238, 0.2)`) — present enough to signal interactivity, transparent enough to not create visual clutter across 11 links. The arrow `→` is a Unicode character, not an SVG or icon, keeping it typographically integrated. A `4px` gap separates text from arrow.

### What typography does NOT do

- No font-weight variation (no bold headings, no light body)
- No text-transform (no uppercase labels or small caps)
- No decorative letter-spacing on content text
- No variable sizing for responsive — the scale is fixed (layout adapts, type doesn't)

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

The `32px` radius is the largest radius on the site and is reserved exclusively for the image container. It creates a distinctive, recognizable shape — almost a "card" but without borders or shadows. The `cover` fit means images are always full-bleed within this shape, never letterboxed.

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
The gradient intensity adapts to the fill brightness: `intensity = 0.15 + brightness * 0.1`. Brighter fills get subtly stronger highlights.

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

**5. Border** — `0.1px solid` with accent-derived color at low opacity. Structurally almost nothing, but it gives the glass a defined edge. Without it, the surface bleeds into the background.

**6. Shape** — `border-radius: 16px`, `padding: 24px 16px`. Half the image container's radius, creating visual kinship without matching it. The padding gives content room inside the glass without creating a separate "card" feel.

### The glass rules

- Glass appears **only** on hover/focus of project links. It does not exist in resting state.
- Glass uses the **same recipe** across all themes — only the hue shifts. Opacity, blur, shadow structure, and radii are invariant.
- Glass **never** appears on elements that aren't project links. It is not a general-purpose surface treatment.
- The fill opacity must stay at or below `0.05`. Higher values make it look like a card background rather than a momentary surface.
- The backdrop blur must stay at `1px` or below. Higher values create a heavy frosted-glass look that fights the site's lightness.

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
3. Simultaneously: stretch/squash deformation via Web Animation API (350ms total, ease-out)
   - Peak deformation at 30% of the timeline
   - Stretch in the direction of movement, squash perpendicular
   - Volume preservation: `newWidth = baseWidth * (baseHeight / newHeight)`

**Exit** (disappear):
1. Pill fades out over 200ms with `ease` easing
2. No position change — it fades where it is

### Gravitational pull

When the cursor drifts toward the edge of a hovered card, the glass pill stretches and shifts toward that edge, as if drawn toward the neighboring card. This is the site's most physically expressive behavior.

- **Activation zone**: Outer 20% of the card
- **Ramp curve**: `pow(t, 1.5)` — imperceptible near the boundary, strong near the edge
- **Max stretch**: 25% of card height at full pull strength
- **Max translate**: 15% of card height at full pull strength
- **Volume preservation**: Width narrows as height increases
- **Lerp rate**: 0.12 per frame — creates a "chasing" feel where the pill accelerates into the pull and decelerates as it approaches
- **Settle threshold**: 0.3px — prevents sub-pixel jitter

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
- **sky**: Bright daylight, blue sky, sunglasses. Open and expansive.
- **pizza**: Night scene, warm artificial light, neon. Energetic and human.

### Image rules

- All images use the same container: `528 x 720px`, `border-radius: 32px`, `object-fit: cover`
- Images fill the container completely — no letterboxing, no padding, no borders
- The rounded corners are the only "frame" — there is no drop shadow, no border, no card surface behind the image
- Project preview images (shown on hover) should share the same aspect ratio and cropping approach
- Images transition via opacity cross-fade only. No scale, no slide, no clip-path reveals.

---

## Interactive Controls

### Mode switcher

Three icon buttons in a row: System (monitor), Light (sun), Dark (moon). Phosphor Icons at 24px. Buttons are 40px square, container is 120x40px.

- Active button: full opacity, accent-derived color
- Inactive buttons: 0.5 opacity, muted color
- Hover on inactive: `scale(1.1)` over 200ms ease-in-out
- Active button does NOT scale on hover — it's already "selected"
- All transitions: 200ms ease-in-out

### Accent picker

Four circular swatches, 24px diameter, `border-radius: 12px` (perfect circle). Container is 144x24px.

- Each swatch is filled with its accent's RGB color
- Active swatch shows an outline ring (the only use of an outline/ring treatment on the site)
- Clicking a swatch triggers the full environmental shift (background + image + glass + browser chrome)

### Control placement

Controls live in the footer of the left column, separated from content by 80px. They are tools, not content — deliberately placed at the bottom where they don't compete with the work.

Layout: `gap: 64px` between mode switcher and accent picker, `padding: 0 16px`.

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
- "Copy Config" button exports current values as code
- State is local to the panel — closing it resets to defaults

The panel's visual language (dark surface, system font, blue accent, technical labels) is deliberately different from the page's language. It reads as a tool or inspector, not as page content.

---

## Anti-Patterns

Things this site deliberately avoids. If you find yourself reaching for any of these, reconsider.

| Don't | Why |
|-------|-----|
| Add a second typeface | The single-typeface constraint is foundational. It forces hierarchy through space and color. |
| Use font-weight for emphasis | Weight 400 everywhere. Hierarchy comes from size and color, not bold. |
| Add drop shadows to cards or containers | The only shadow is the inner glow on the glass effect and the panel shadow. Shadows imply elevation, and this site is flat. |
| Use color to highlight individual elements | Color is environmental (background tint), not component-level (colored buttons/badges). |
| Add borders to section dividers | Sections are separated by space alone. Lines or borders add visual noise. |
| Animate on scroll | Content is static. Only user-initiated actions (hover, click) trigger motion. |
| Add loading states or skeleton screens | The site is small enough to load instantly. Skeleton screens imply enterprise scale, not personal craft. |
| Use a card metaphor for project links | Links are text, not cards. The glass effect is momentary, not a resting surface. |
| Stack the right column below content on mobile | The interaction model doesn't translate to touch. Remove it entirely rather than degrading it. |
| Use more than two text sizes | 36px for title, 18px for everything else. That's the scale. |
| Add hover underlines or color changes to links | The glass effect IS the hover state. No additional text-level hover treatment needed. |
| Use transition durations outside the timing hierarchy | 150 / 200 / 300 / 500ms. Pick the one that matches the action's weight. |
| Mix easing curves arbitrarily | Use the Smooth curve (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) as default. Only deviate for specific physical behaviors (snap-back, overshoot). |

---

## Coherence Checklist

When implementing or modifying any part of the site, verify:

- [ ] Does it use Manrope weight 400?
- [ ] Does it use the spacing hierarchy (80/64/40/24)?
- [ ] Is the only border-radius either 16px (glass) or 32px (image)?
- [ ] Does color come from CSS custom properties, not hardcoded values?
- [ ] Is the element visually identical across all four accent themes (with only hue shifting)?
- [ ] Does any animation use one of the four timing tiers (150/200/300/500ms)?
- [ ] Does the Smooth easing curve feel right, or does this interaction need a specific curve?
- [ ] Would this element make sense in both light and dark mode?
- [ ] Is this addition necessary, or would the site be better without it?
