import type { SVGProps } from 'react'

// Minimal stroke-based line icon set — the real product uses inline SVG icons
// throughout (confirmed via the Paper.design capture), never emoji glyphs.
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

export function PlusIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function BookmarkIcon({ size = 16, filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16l-6-3.5L6 20V4Z" />
    </svg>
  )
}

export function UsersIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="7" r="3.25" />
      <path d="M22 20v-1a3.5 3.5 0 0 0-2.5-3.36M15.5 3.24a3.25 3.25 0 0 1 0 6.3" />
    </svg>
  )
}

export function FolderIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z" />
    </svg>
  )
}

export function SearchIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function HomeIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function HistoryIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
    </svg>
  )
}

export function ChatIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H5a1 1 0 0 1-1-1V5Z" />
    </svg>
  )
}

export function DocumentIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
    </svg>
  )
}

export function BookIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
    </svg>
  )
}

export function GraphIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="6" cy="6" r="2.25" />
      <circle cx="6" cy="18" r="2.25" />
      <circle cx="18" cy="12" r="2.25" />
      <path d="M8 6.8 16 11M8 17.2 16 13" />
    </svg>
  )
}

export function QuoteIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M7 8a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3M7 8V6M7 16v2m9-10a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3m0-8V6m0 10v2" />
    </svg>
  )
}

export function LinkIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 13 4.5a3.5 3.5 0 0 1 5 5l-2 2M13 17.5l-2 2a3.5 3.5 0 0 1-5-5l2-2" />
    </svg>
  )
}

export function DownloadIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 18v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" />
    </svg>
  )
}

export function ExternalLinkIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M9 6h9v9" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export function CloseIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function ArrowUpIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function BackArrowIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

export function FilterIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

export function BellIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 10a6 6 0 0 1 12 0v4l1.5 3h-15L6 14v-4Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function ListViewIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

export function CardViewIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  )
}

export function TableViewIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 10h18M9 10v10" />
    </svg>
  )
}
