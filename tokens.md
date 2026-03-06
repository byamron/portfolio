# Design Tokens

All values extracted from Framer color panel. HSL format: `hsl(H, S%, L%)`.

---

## Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--text-dark` | `hsl(0, 0%, 7%)` | `hsl(0, 0%, 99%)` | Primary text, headings |
| `--text-medium` | `hsl(0, 0%, 20%)` | `hsl(0, 0%, 90%)` | Secondary text, body |
| `--text-grey` | `hsl(240, 2%, 45%)` | `hsl(240, 2%, 75%)` | Tertiary text, captions |
| `--text-light-grey` | `hsl(0, 0%, 70%)` | `hsl(0, 0%, 40%)` | Disabled/muted text |
| `--text-light` | `hsl(0, 0%, 100%)` | `hsl(0, 0%, 7%)` | Inverse text (on dark/light surfaces) |
| `--text-link` | `hsl(219, 49%, 53%)` | `hsl(220, 54%, 81%)` | Link text |
| `--text-underline` | `hsla(0, 0%, 7%, 0.2)` | `hsla(0, 0%, 93%, 0.2)` | Link underline decoration |

**Notes:**
- Text colors are **not theme-dependent** — they stay the same across table/portrait/sky/pizza/vineyard.
- They only change between light and dark appearance mode.
- `--text-grey` has a very slight blue tint (240deg hue, 2% saturation).

---

## Background Colors (Theme-Specific)

These are the 5 named theme backgrounds. They change based on both theme selection AND appearance mode.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg-sky` | `hsl(200, 23%, 95%)` | `hsl(200, 22%, 8%)` |
| `--bg-table` | `hsl(30, 17%, 91%)` | `hsl(33, 18%, 12%)` |
| `--bg-portrait` | `hsl(39, 15%, 92%)` | `hsl(41, 14%, 10%)` |
| `--bg-pizza` | `hsl(10, 30%, 96%)` | `hsl(8, 22%, 7%)` |
| `--bg-vineyard` | `hsl(86, 18%, 93%)` | `hsl(88, 18%, 9%)` |

**Pattern:** In light mode, backgrounds are very desaturated and near-white (L: 91-96%). In dark mode, they're very dark (L: 7-12%) with similar hue but slightly shifted saturation.

---

## Swatch Colors (Theme Accent)

These are the theme accent/swatch colors. They appear **identical in light and dark mode** (the swatch itself doesn't change — it's the accent spot color for each theme).

| Token | Value (both modes) |
|-------|-------------------|
| `--swatch-sky` | `hsl(204, 50%, 70%)` |
| `--swatch-table` | `hsl(34, 50%, 60%)` |
| `--swatch-portrait` | `hsl(43, 22%, 62%)` |
| `--swatch-pizza` | `hsl(15, 53%, 64%)` |
| `--swatch-vineyard` | `hsl(90, 36%, 48%)` |

---

## CSS Implementation (Draft)

Canonical attribute names: `data-theme` (light/dark), `data-accent` (table/portrait/sky/pizza/vineyard), both on `<html>`.

```css
/* Appearance mode: light */
[data-theme="light"] {
  --text-dark: hsl(0, 0%, 7%);
  --text-medium: hsl(0, 0%, 20%);
  --text-grey: hsl(240, 2%, 45%);
  --text-light-grey: hsl(0, 0%, 70%);
  --text-light: hsl(0, 0%, 100%);
  --text-link: hsl(219, 49%, 53%);
  --text-underline: hsla(0, 0%, 7%, 0.2);
  --surface: hsl(0, 0%, 96%);
  --border: hsl(0, 0%, 85%);
}

/* Appearance mode: dark (default) */
[data-theme="dark"] {
  --text-dark: hsl(0, 0%, 99%);
  --text-medium: hsl(0, 0%, 90%);
  --text-grey: hsl(240, 2%, 75%);
  --text-light-grey: hsl(0, 0%, 40%);
  --text-light: hsl(0, 0%, 7%);
  --text-link: hsl(220, 54%, 81%);
  --text-underline: hsla(0, 0%, 93%, 0.2);
  --surface: hsl(0, 0%, 10%);
  --border: hsl(0, 0%, 20%);
}

/* Theme backgrounds + swatches + accent-hue (light) */
[data-theme="light"][data-accent="sky"] {
  --bg: hsl(200, 23%, 95%);
  --swatch: hsl(204, 50%, 70%);
  --accent-hue: 204;
}
[data-theme="light"][data-accent="table"] {
  --bg: hsl(30, 17%, 91%);
  --swatch: hsl(34, 50%, 60%);
  --accent-hue: 34;
}
[data-theme="light"][data-accent="portrait"] {
  --bg: hsl(39, 15%, 92%);
  --swatch: hsl(43, 22%, 62%);
  --accent-hue: 43;
}
[data-theme="light"][data-accent="pizza"] {
  --bg: hsl(10, 30%, 96%);
  --swatch: hsl(15, 53%, 64%);
  --accent-hue: 15;
}
[data-theme="light"][data-accent="vineyard"] {
  --bg: hsl(86, 18%, 93%);
  --swatch: hsl(90, 36%, 48%);
  --accent-hue: 90;
}

/* Theme backgrounds + swatches + accent-hue (dark) */
[data-theme="dark"][data-accent="sky"] {
  --bg: hsl(200, 22%, 8%);
  --swatch: hsl(204, 50%, 70%);
  --accent-hue: 204;
}
[data-theme="dark"][data-accent="table"] {
  --bg: hsl(33, 18%, 12%);
  --swatch: hsl(34, 50%, 60%);
  --accent-hue: 34;
}
[data-theme="dark"][data-accent="portrait"] {
  --bg: hsl(41, 14%, 10%);
  --swatch: hsl(43, 22%, 62%);
  --accent-hue: 43;
}
[data-theme="dark"][data-accent="pizza"] {
  --bg: hsl(8, 22%, 7%);
  --swatch: hsl(15, 53%, 64%);
  --accent-hue: 15;
}
[data-theme="dark"][data-accent="vineyard"] {
  --bg: hsl(88, 18%, 9%);
  --swatch: hsl(90, 36%, 48%);
  --accent-hue: 90;
}
```

---

## Framer-Only Tokens (Not Migrated)

The following tokens appeared in the Framer Background panel but are **not needed** for the portfolio theme system:

Default, Default Frosted, Extra Light, Mochi Blue, Mochi Blue Transparent, UW Purple, UW Purple Transparent, Surface-Subtle, Surface-80, Tint.

## Summary

- **Text colors** are theme-independent. They only change with light/dark appearance mode.
- **Background colors** change with both theme selection (sky/table/portrait/pizza/vineyard) AND appearance mode (light/dark).
- **Swatch colors** are constant across appearance modes — they're the accent spot color for each theme.
- Total: **19 unique token values** (7 text + 5 bg + 5 swatch) across 2 appearance modes.
