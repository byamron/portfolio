---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Animation defaults

Prefer physically accurate curves (ease-out for entrances, ease-in-out for transitions). Avoid slow ease-in openers — they read as sluggish. When implementing motion, start with snappy timing and let Ben dial it back rather than starting conservative.

- Use spring physics (damped harmonic oscillator) for interactive motion when possible
- Ease-out for elements entering view
- Ease-in-out for state transitions
- Never use linear easing for UI motion
- Keep durations short (150–350ms) unless the animation is decorative
