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
- Text colors are **not theme-dependent** — they stay the same across table/portrait/sky/pizza.
- They only change between light and dark appearance mode.
- `--text-grey` has a very slight blue tint (240deg hue, 2% saturation).

---

## Background Colors (Theme-Specific)

These are the 4 named theme backgrounds. They change based on both theme selection AND appearance mode.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg-sky` | `hsl(200, 23%, 95%)` | `hsl(200, 22%, 8%)` |
| `--bg-table` | `hsl(30, 17%, 91%)` | `hsl(33, 18%, 12%)` |
| `--bg-portrait` | `hsl(42, 22%, 91%)` | `hsl(47, 18%, 10%)` |
| `--bg-pizza` | `hsl(10, 30%, 96%)` | `hsl(8, 22%, 7%)` |

**Pattern:** In light mode, backgrounds are very desaturated and near-white (L: 91-96%). In dark mode, they're very dark (L: 7-12%) with similar hue but slightly shifted saturation.

---

## Swatch Colors (Theme Accent)

These are the theme accent/swatch colors. They appear **identical in light and dark mode** (the swatch itself doesn't change — it's the accent spot color for each theme).

| Token | Value (both modes) |
|-------|-------------------|
| `--swatch-sky` | `hsl(204, 50%, 70%)` |
| `--swatch-table` | `hsl(34, 50%, 60%)` |
| `--swatch-portrait` | `hsl(47, 34%, 64%)` |
| `--swatch-pizza` | `hsl(15, 53%, 64%)` |

---

## CSS Implementation (Draft)

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
}

/* Appearance mode: dark */
[data-theme="dark"] {
  --text-dark: hsl(0, 0%, 99%);
  --text-medium: hsl(0, 0%, 90%);
  --text-grey: hsl(240, 2%, 75%);
  --text-light-grey: hsl(0, 0%, 40%);
  --text-light: hsl(0, 0%, 7%);
  --text-link: hsl(220, 54%, 81%);
  --text-underline: hsla(0, 0%, 93%, 0.2);
}

/* Theme backgrounds + swatches (light) */
[data-theme="light"][data-color-theme="sky"] {
  --bg: hsl(200, 23%, 95%);
  --swatch: hsl(204, 50%, 70%);
}
[data-theme="light"][data-color-theme="table"] {
  --bg: hsl(30, 17%, 91%);
  --swatch: hsl(34, 50%, 60%);
}
[data-theme="light"][data-color-theme="portrait"] {
  --bg: hsl(42, 22%, 91%);
  --swatch: hsl(47, 34%, 64%);
}
[data-theme="light"][data-color-theme="pizza"] {
  --bg: hsl(10, 30%, 96%);
  --swatch: hsl(15, 53%, 64%);
}

/* Theme backgrounds + swatches (dark) */
[data-theme="dark"][data-color-theme="sky"] {
  --bg: hsl(200, 22%, 8%);
  --swatch: hsl(204, 50%, 70%);
}
[data-theme="dark"][data-color-theme="table"] {
  --bg: hsl(33, 18%, 12%);
  --swatch: hsl(34, 50%, 60%);
}
[data-theme="dark"][data-color-theme="portrait"] {
  --bg: hsl(47, 18%, 10%);
  --swatch: hsl(47, 34%, 64%);
}
[data-theme="dark"][data-color-theme="pizza"] {
  --bg: hsl(8, 22%, 7%);
  --swatch: hsl(15, 53%, 64%);
}
```

---

## Framer-Only Tokens (Not Migrated)

The following tokens appeared in the Framer Background panel but are **not needed** for the portfolio theme system:

Default, Default Frosted, Extra Light, Mochi Blue, Mochi Blue Transparent, UW Purple, UW Purple Transparent, Surface-Subtle, Surface-80, Tint.

## Summary

- **Text colors** are theme-independent. They only change with light/dark appearance mode.
- **Background colors** change with both theme selection (sky/table/portrait/pizza) AND appearance mode (light/dark).
- **Swatch colors** are constant across appearance modes — they're the accent spot color for each theme.
- Total: **15 unique token values** (7 text + 4 bg + 4 swatch) across 2 appearance modes.
