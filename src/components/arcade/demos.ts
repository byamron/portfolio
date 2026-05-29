// Portfolio-side allowlist: the polished subset of ui-playground demos
// surfaced at /arcade. Adding a demo here is one of two gates required
// to ship it publicly — the other is the ui-playground submodule pointer.
//
// Catalogue codes are renumbered for a contiguous public-facing sequence
// (e.g. GitHub Sparkline was ALG·002 with sibling ALG·001 archived; here
// it becomes ALG·001).
//
// Paths are prefixed with /arcade/ so ArcadeGallery's useNavigate() lands
// on the portfolio-scoped routes.

import { bg, demoPalettes } from "@playground/palette";

export interface GalleryDemo {
  path: string;
  title: string;
  description: string;
  bg: string;
  hue: number;
  family: string;
  catalogue: string;
}

const palette = (slug: keyof typeof demoPalettes) => ({
  bg: bg(demoPalettes[slug]),
  hue: demoPalettes[slug].hue,
});

export const galleryDemos: GalleryDemo[] = [
  {
    path: "/arcade/dvd-bounce",
    title: "DVD Bounce",
    description:
      "Bouncing logo with squash physics and corner celebrations.",
    ...palette("dvd-bounce"),
    family: "Mecanica inertia",
    catalogue: "MEC·001",
  },
  {
    path: "/arcade/slide-unlock",
    title: "Slide to Unlock",
    description:
      "Drag the thumb across a track. A fluid WebGL shader follows it.",
    ...palette("slide-unlock"),
    family: "Liquida tactus",
    catalogue: "LIQ·001",
  },
  {
    path: "/arcade/glass-pull",
    title: "Glass Pull",
    description:
      "A glass pill stretches between items as your cursor hops between them.",
    ...palette("glass-pull"),
    family: "Liquida tactus",
    catalogue: "LIQ·002",
  },
  {
    path: "/arcade/theme-sidebar",
    title: "Theme Sidebar",
    description:
      "Pick color, intensity, and mode from an expandable glass-pill sidebar.",
    ...palette("theme-sidebar"),
    family: "Chromatica",
    catalogue: "CHR·001",
  },
  {
    path: "/arcade/color-hold-pick",
    title: "Color Hold Pick",
    description:
      "Press and hold a rainbow swatch — the card becomes a live HSB canvas.",
    ...palette("color-hold-pick"),
    family: "Chromatica",
    catalogue: "CHR·002",
  },
  {
    path: "/arcade/figma-highfive",
    title: "Figma High-Five",
    description:
      "The FigJam share modal, with a permission level no one asked for.",
    ...palette("figma-highfive"),
    family: "Sorenidae",
    catalogue: "SOR·001",
  },
  {
    path: "/arcade/git-toggle",
    title: "Git Toggle",
    description:
      "Flip a setting by opening a PR, passing CI, getting a review, and merging to main.",
    ...palette("git-toggle"),
    family: "Sorenidae",
    catalogue: "SOR·002",
  },
  {
    path: "/arcade/page-transition",
    title: "Page Transition",
    description:
      "Click and the arrow winds up, flies off, and the page fades through.",
    ...palette("page-transition"),
    family: "Transitiones",
    catalogue: "TRN·001",
  },
  {
    path: "/arcade/github-sparkline",
    title: "GitHub Sparkline",
    description:
      "A sparkline hints at the heatmap; click and the bars shake into place.",
    ...palette("github-sparkline"),
    family: "Algoricae",
    catalogue: "ALG·001",
  },
];

const ROMAN = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
  "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI",
];

export const roman = (i: number) => ROMAN[i] ?? String(i + 1);
