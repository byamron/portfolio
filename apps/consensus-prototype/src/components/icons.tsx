/**
 * Lucide on a 24 grid.
 *
 * Where the artboards ship an icon, the geometry here is the artboard's own —
 * lifted from the exported SVG rather than approximated — so the prototype and
 * the product draw the same shape. Anything not on an artboard uses the stock
 * Lucide path for the closest-matching name.
 */
type Shape = string | { c: [number, number, number] }

const ICONS = {
  // From the artboards ------------------------------------------------------
  /** lucide/file — the product's "Papers (n)" icon. */
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4'],
  /** lucide/message-circle */
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  /** lucide/git-branch — Citation Graph in the product's Tools rail. */
  citationGraph: ['M6 3v12', { c: [18, 6, 3] }, { c: [6, 18, 3] }, 'M18 9a9 9 0 0 1-9 9'],
  /** lucide/house */
  home: [
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ],
  /** lucide/bookmark */
  bookmark: ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  /** lucide/history */
  history: [
    'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    'M3 3v5h5',
    'M12 7v5l4 2',
  ],
  /** lucide/panel-left */
  panel: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 3v18'],
  /** lucide/circle-dot-dashed — the graph's Density control. */
  density: [
    'M10.1 2.18a9.93 9.93 0 0 1 3.8 0',
    'M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7',
    'M21.82 10.1a9.93 9.93 0 0 1 0 3.8',
    'M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69',
    'M13.9 21.82a9.94 9.94 0 0 1-3.8 0',
    'M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7',
    'M2.18 13.9a9.93 9.93 0 0 1 0-3.8',
    'M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69',
    { c: [12, 12, 1] },
  ],
  /** lucide/mail */
  mail: ['M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z', 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7'],

  // Stock Lucide ------------------------------------------------------------
  search: [{ c: [11, 11, 8] }, 'm21 21-4.34-4.34'],
  fileText: [
    'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
    'M14 2v4a2 2 0 0 0 2 2h4',
    'M10 9H8',
    'M16 13H8',
    'M16 17H8',
  ],
  layers: [
    'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    'm6.08 10.37-3.5 1.6a1 1 0 0 0 0 1.83l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.61',
  ],
  sparkle: [
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  ],
  pencil: [
    'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    'm15 5 4 4',
  ],
  quote: [
    'M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
    'M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z',
  ],
  clip: [
    'M13.234 20.252 21 12.3',
    'm16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486',
  ],
  folder: [
    'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
  ],
  filter: ['M3 6h18', 'M7 12h10', 'M10 18h4'],
  mic: ['M12 19v3', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0z'],
  share: [
    { c: [18, 5, 3] },
    { c: [6, 12, 3] },
    { c: [18, 19, 3] },
    'm8.59 13.51 6.83 3.98',
    'm15.41 6.51-6.82 3.98',
  ],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5'],
  sliders: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  plus: ['M5 12h14', 'M12 5v14'],
  minus: ['M5 12h14'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronRight: ['m9 18 6-6-6-6'],
  arrowUp: ['M12 19V5', 'm5 12 7-7 7 7'],
  arrowLeft: ['M19 12H5', 'm12 19-7-7 7-7'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  expand: ['M15 3h6v6', 'M9 21H3v-6', 'm21 3-7 7', 'M3 21l7-7'],
  /** lucide/maximize — "fit to view" on the graph. */
  fit: ['M8 3H5a2 2 0 0 0-2 2v3', 'M21 8V5a2 2 0 0 0-2-2h-3', 'M3 16v3a2 2 0 0 0 2 2h3', 'M16 21h3a2 2 0 0 0 2-2v-3'],
  zoomIn: [{ c: [11, 11, 8] }, 'm21 21-4.3-4.3', 'M11 8v6', 'M8 11h6'],
  zoomOut: [{ c: [11, 11, 8] }, 'm21 21-4.3-4.3', 'M8 11h6'],
  /** lucide/ellipsis-vertical */
  more: [{ c: [12, 5, 1] }, { c: [12, 12, 1] }, { c: [12, 19, 1] }],
  /** lucide/trash-2 */
  trash: [
    'M3 6h18',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M10 11v6',
    'M14 11v6',
  ],
  /** From the home artboard — the natural-language filters mark. */
  filters: ['M11 6H3', 'M15 6h6', 'M18 9V3', 'M7 12h8', 'M10 18h4'],
  /** lucide/git-compare — the artboard's "compare two approaches" mark. */
  compare: [
    { c: [5, 6, 3] },
    { c: [19, 18, 3] },
    'M12 6h5a2 2 0 0 1 2 2v7',
    'm15 9-3-3 3-3',
    'M12 18H7a2 2 0 0 1-2-2V9',
    'm9 15 3 3-3 3',
  ],
  /** lucide/stethoscope */
  stethoscope: [
    'M11 2v2',
    'M5 2v2',
    'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1',
    'M8 15a6 6 0 0 0 12 0v-3',
    { c: [20, 10, 2] },
  ],
  /** lucide/circle-check */
  yesNo: [{ c: [12, 12, 10] }, 'm9 12 2 2 4-4'],
  /** lucide/flask-conical — Deep. */
  deep: [
    'M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2',
    'M6.453 15h11.094',
    'M8.5 2h7',
  ],
  /** lucide/download */
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  /** lucide/upload */
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  /** lucide/link */
  link: [
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  ],
  /** lucide/sun */
  sun: [
    { c: [12, 12, 4] },
    'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41',
    'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41',
  ],
  /** lucide/moon */
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  /** lucide/circle-dollar-sign */
  pricing: [{ c: [12, 12, 10] }, 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 18V6'],
  /** lucide/circle-question-mark */
  help: [{ c: [12, 12, 10] }, 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
  /** lucide/ghost */
  ghost: [
    'M9 10h.01', 'M15 10h.01',
    'M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z',
  ],
  /** lucide/log-out */
  signOut: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  /** lucide/chevrons-up-down */
  chevronUpDown: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  /** lucide/folder-plus */
  folderPlus: [
    'M12 10v6',
    'M9 13h6',
    'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
  ],
  /** lucide/undo-2 */
  undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11'],
} satisfies Record<string, Shape[]>

export type IconName = keyof typeof ICONS

export function Icon({
  name,
  size = 16,
  className = '',
  strokeWidth = 2,
  filled = false,
}: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  /** Solid rather than outline — the product uses both for bookmarks. */
  filled?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name].map((shape, i) =>
        typeof shape === 'string' ? (
          <path key={i} d={shape} />
        ) : (
          <circle key={i} cx={shape.c[0]} cy={shape.c[1]} r={shape.c[2]} />
        ),
      )}
    </svg>
  )
}

/** The Consensus mark, lifted from the artboard. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={(size * 28) / 30} height={size} viewBox="0 0 28 30" aria-label="Consensus">
      <path
        d="M1.252 9C2.534 8.536 4.002 8.552 5.251 9.04L6 9.333C7.105 9.765 7.893 10.508 8.437 11.369C8.643 10.998 8.88 10.643 9.148 10.309C10.203 8.993 11.671 8.071 13.315 7.692C14.959 7.313 16.683 7.499 18.208 8.221C18.591 8.402 18.956 8.614 19.299 8.855C20.996 10.042 23.223 10.922 25.079 10.002C26.934 9.082 27.723 6.789 26.372 5.219C25.011 3.637 23.326 2.345 21.416 1.441C18.366 -0.002 14.918 -0.375 11.631 0.383C8.343 1.141 5.407 2.985 3.296 5.618C2.463 6.657 1.778 7.795 1.252 9Z"
        fill="#068EF1"
      />
      <path
        d="M27.184 23.602C28.392 21.92 27.406 19.704 25.477 18.95L24.728 18.657C23.213 18.064 21.535 18.877 20.408 20.049C19.726 20.76 18.91 21.328 18.008 21.723C17.106 22.118 16.134 22.332 15.15 22.352C14.165 22.371 13.186 22.197 12.269 21.838C11.351 21.479 10.514 20.943 9.804 20.261C9.093 19.579 8.525 18.763 8.13 17.861C7.735 16.959 7.521 15.987 7.501 15.003C7.469 13.376 6.787 11.642 5.272 11.049L4.523 10.756C2.594 10.002 0.366 10.961 0.113 13.016C0.026 13.723 -0.011 14.437 0.003 15.152C0.042 17.122 0.469 19.064 1.259 20.869C1.371 21.125 1.49 21.377 1.616 21.626L0.102 27.478C-0.284 28.968 1.089 30.317 2.572 29.906L8.358 28.302C8.743 28.492 9.136 28.666 9.537 28.823C11.372 29.54 13.33 29.889 15.299 29.85C17.269 29.811 19.211 29.384 21.016 28.594C22.82 27.804 24.451 26.666 25.816 25.246C26.312 24.73 26.769 24.18 27.184 23.602Z"
        fill="#3BCDAA"
      />
    </svg>
  )
}
