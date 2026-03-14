import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useCursor } from '@/contexts/CursorContext'
import contributionData from '@/data/contributions.json'

interface ContributionDay {
  date: string
  contributionCount: number
  level: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
  fetchedAt: string | null
}

const data = contributionData as ContributionData

const CELL_SIZE = 10
const CELL_GAP = 2
const CELL_STEP = CELL_SIZE + CELL_GAP
const LABEL_TOP = 16

const ACCENT_HUES: Record<string, number> = {
  table: 34, portrait: 43, sky: 204, pizza: 15, vineyard: 90,
}

const BASE_SAT = [10, 45, 48, 52, 55]
const BASE_ALPHA = [0.06, 0.28, 0.42, 0.58, 0.75]

function contribFill(level: number, hue: number, t: number, isDark: boolean): string {
  if (isDark) {
    // Dark mode: brighter/more saturated as intensity increases
    const lightness = 50 + t * 10
    const sat = (BASE_SAT[level] ?? 10) + t * 15
    return `hsla(${hue}, ${sat}%, ${lightness}%, ${BASE_ALPHA[level] ?? 0.06})`
  }
  // Light mode: darker/richer as intensity increases
  const lightness = 50 - t * 15
  const sat = (BASE_SAT[level] ?? 10) + t * 10
  return `hsla(${hue}, ${sat}%, ${lightness}%, ${BASE_ALPHA[level] ?? 0.06})`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  return `${month} ${day}${suffix}`
}

function pad2(n: number) { return String(n).padStart(2, '0') }

function getTooltipText(date: string, count: number): string {
  const now = new Date()
  const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  if (date >= today) return 'No contributions (yet)'
  return `${count} contribution${count !== 1 ? 's' : ''} on ${formatDate(date)}`
}

interface GridCell {
  date: string
  count: number
  level: number
  inYear: boolean
}

function buildYearGrid(year: number): { grid: GridCell[][], totalContributions: number } {
  const lookup = new Map<string, ContributionDay>()
  for (const week of data.weeks) {
    for (const day of week.contributionDays) {
      lookup.set(day.date, day)
    }
  }

  const jan1 = new Date(year, 0, 1)
  const startOffset = jan1.getDay()
  const gridStart = new Date(year, 0, 1 - startOffset)

  const dec31 = new Date(year, 11, 31)
  const endOffset = 6 - dec31.getDay()
  const gridEnd = new Date(year, 11, 31 + endOffset)

  const grid: GridCell[][] = []
  let total = 0
  const current = new Date(gridStart)

  while (current <= gridEnd) {
    const week: GridCell[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = `${current.getFullYear()}-${pad2(current.getMonth() + 1)}-${pad2(current.getDate())}`
      const inYear = current.getFullYear() === year
      const contrib = lookup.get(dateStr)
      const count = contrib?.contributionCount ?? 0
      const level = contrib?.level ?? 0
      if (inYear) total += count
      week.push({ date: dateStr, count, level, inYear })
      current.setDate(current.getDate() + 1)
    }
    grid.push(week)
  }

  return { grid, totalContributions: total }
}

interface TooltipState {
  text: string
  x: number
  y: number
}

export function ContributionHeatmap() {
  const { grid, totalContributions } = useMemo(() => buildYearGrid(2026), [])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [focusedCell, setFocusedCell] = useState<{ week: number; day: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ week: number; day: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { bgIntensity, accentColor, resolvedAppearance } = useTheme()
  const { cursorMode } = useCursor()
  const hue = ACCENT_HUES[accentColor] ?? 34
  const isDark = resolvedAppearance === 'dark'

  const monthLabels = useMemo(() => {
    const jan1 = new Date(2026, 0, 1)
    const gridStartDay = new Date(2026, 0, 1 - jan1.getDay())
    const labels: { month: string; col: number }[] = []

    for (let m = 0; m < 12; m++) {
      const firstOfMonth = new Date(2026, m, 1)
      const daysDiff = Math.floor((firstOfMonth.getTime() - gridStartDay.getTime()) / (86400000))
      const col = Math.floor(daysDiff / 7)
      labels.push({ month: MONTHS[m] ?? '', col })
    }
    return labels
  }, [])

  const showTooltipForCell = useCallback((week: number, day: number) => {
    const cell = grid[week]?.[day]
    if (!cell?.inYear) return
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return
    const rectEl = svg.querySelector(`rect[data-date="${cell.date}"]`) as SVGRectElement | null
    if (!rectEl) return
    const containerRect = container.getBoundingClientRect()
    const cellRect = rectEl.getBoundingClientRect()
    setTooltip({
      text: getTooltipText(cell.date, cell.count),
      x: cellRect.left + cellRect.width / 2 - containerRect.left,
      y: cellRect.top - containerRect.top,
    })
  }, [grid])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) return
    e.preventDefault()
    if (e.key === 'Escape') {
      setFocusedCell(null)
      setTooltip(null)
      return
    }
    setFocusedCell(prev => {
      let week = prev?.week ?? 0
      let day = prev?.day ?? 0
      switch (e.key) {
        case 'ArrowRight': week = Math.min(week + 1, grid.length - 1); break
        case 'ArrowLeft': week = Math.max(week - 1, 0); break
        case 'ArrowDown': day = Math.min(day + 1, 6); break
        case 'ArrowUp': day = Math.max(day - 1, 0); break
      }
      const cell = grid[week]?.[day]
      if (!cell?.inYear) return prev
      return { week, day }
    })
  }, [grid])

  const handleFocus = useCallback(() => {
    for (let w = 0; w < grid.length; w++) {
      const week = grid[w]
      if (!week) continue
      for (let d = 0; d < week.length; d++) {
        if (week[d]?.inYear) {
          setFocusedCell({ week: w, day: d })
          return
        }
      }
    }
  }, [grid])

  const handleBlur = useCallback(() => {
    setFocusedCell(null)
    setTooltip(null)
  }, [])

  useEffect(() => {
    if (focusedCell) {
      showTooltipForCell(focusedCell.week, focusedCell.day)
    }
  }, [focusedCell, showTooltipForCell])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    setFocusedCell(null)
    const svg = svgRef.current
    if (!svg) return

    // Find which cell the cursor is on or nearest to
    let week: number, day: number
    const target = e.target as SVGElement
    const weekAttr = target.getAttribute('data-week')
    const dayAttr = target.getAttribute('data-day')

    if (weekAttr !== null && dayAttr !== null) {
      // Directly on a cell
      week = parseInt(weekAttr)
      day = parseInt(dayAttr)
    } else {
      // In a gap or on labels — find nearest cell via SVG coordinates
      const ctm = svg.getScreenCTM()
      if (!ctm) { setTooltip(null); setHoveredCell(null); return }
      const svgX = (e.clientX - ctm.e) / ctm.a
      const svgY = (e.clientY - ctm.f) / ctm.d
      // Above the grid area (month labels) — no snap
      if (svgY < LABEL_TOP - CELL_SIZE) {
        setTooltip(null); setHoveredCell(null); return
      }
      week = Math.max(0, Math.min(grid.length - 1, Math.round((svgX - CELL_SIZE / 2) / CELL_STEP)))
      day = Math.max(0, Math.min(6, Math.round((svgY - LABEL_TOP - CELL_SIZE / 2) / CELL_STEP)))
    }

    const cell = grid[week]?.[day]
    if (!cell?.inYear) {
      setTooltip(null); setHoveredCell(null); return
    }

    setHoveredCell({ week, day })
    showTooltipForCell(week, day)
  }, [grid, showTooltipForCell])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHoveredCell(null)
  }, [])

  if (grid.length === 0) return null

  const cols = grid.length
  const rows = 7
  const gridWidth = cols * CELL_STEP - CELL_GAP
  const gridHeight = rows * CELL_STEP - CELL_GAP
  const svgWidth = gridWidth
  const svgHeight = LABEL_TOP + gridHeight

  return (
    <section
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', marginTop: 32 }}
    >
      <div
        data-glass-break
        tabIndex={0}
        aria-label="Contribution heatmap. Use arrow keys to navigate days."
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ position: 'relative', outline: 'none' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={`GitHub contribution graph: ${totalContributions} contributions in 2026`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block' }}
        >
          {/* Month labels */}
          {monthLabels.map(({ month, col }) => (
            <text
              key={month}
              x={col * CELL_STEP}
              y={LABEL_TOP - 5}
              style={{
                fill: 'var(--text-grey)',
                fontSize: 12,
                fontFamily: "'Onest', sans-serif",
              }}
            >
              {month}
            </text>
          ))}

          {/* Grid cells */}
          {grid.map((week, weekIdx) =>
            week.map((cell, dayIdx) => {
              if (!cell.inYear) return null
              return (
                <rect
                  key={cell.date}
                  x={weekIdx * CELL_STEP}
                  y={LABEL_TOP + dayIdx * CELL_STEP}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  style={{ fill: contribFill(cell.level, hue, bgIntensity, isDark) }}
                  data-date={cell.date}
                  data-count={cell.count}
                  data-week={weekIdx}
                  data-day={dayIdx}
                />
              )
            })
          )}

          {/* Mouse hover highlight (standard/figpal cursor modes only) */}
          {cursorMode !== 'invert' && hoveredCell && grid[hoveredCell.week]?.[hoveredCell.day]?.inYear && (
            <rect
              x={hoveredCell.week * CELL_STEP}
              y={LABEL_TOP + hoveredCell.day * CELL_STEP}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              fill={isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Keyboard focus indicator */}
          {focusedCell && grid[focusedCell.week]?.[focusedCell.day]?.inYear && (
            <rect
              x={focusedCell.week * CELL_STEP - 1}
              y={LABEL_TOP + focusedCell.day * CELL_STEP - 1}
              width={CELL_SIZE + 2}
              height={CELL_SIZE + 2}
              rx={3}
              fill="none"
              stroke="var(--text-dark)"
              strokeWidth={2}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
        {/* Screen reader announcements for keyboard navigation */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {focusedCell ? tooltip?.text ?? '' : ''}
        </div>
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: "'Onest', sans-serif",
              fontWeight: 400,
              lineHeight: 1.3,
              color: 'var(--text-dark)',
              background: 'var(--bg)',
              border: '1px solid var(--text-light-grey)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontFamily: "'Onest', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--text-grey)',
        }}>
          {totalContributions} contributions in 2026. Most repos are private (sorry).
        </span>
        <a
          href="https://github.com/byamron"
          target="_blank"
          rel="noopener noreferrer"
          data-link-card
          data-border-radius="8"
          style={{
            fontFamily: "'Onest', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--text-grey)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 3,
            padding: '6px 10px',
            margin: '0 -10px',
            borderRadius: 8,
            border: '0.1px solid transparent',
          }}
        >
          GitHub
        </a>
      </div>
    </section>
  )
}
