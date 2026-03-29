import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useCursor } from '@/contexts/CursorContext'
import { useHover } from '@/contexts/HoverContext'
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
const LABEL_HEIGHT = 20

const ACCENT_HUES: Record<string, number> = {
  table: 34, portrait: 43, sky: 204, pizza: 15, vineyard: 90,
}

export type HeatmapMode = 'default' | 'mono' | 'mono-all' | 'glass' | 'inset' | 'collapsed' | 'scroll-fade' | 'sparkline'

export function contribFill(count: number, maxCount: number, hue: number, t: number, isDark: boolean): string {
  if (count === 0) {
    if (isDark) return `hsla(${hue}, 8%, ${50 + t * 10}%, 0.05)`
    return `hsla(${hue}, 8%, ${50 - t * 15}%, 0.05)`
  }
  const intensity = Math.sqrt(count / maxCount)
  const alpha = 0.18 + intensity * 0.72
  const sat = 30 + intensity * 40
  if (isDark) {
    const lightness = 50 + t * 10
    return `hsla(${hue}, ${sat + t * 15}%, ${lightness}%, ${alpha})`
  }
  const lightness = 50 - t * 15
  return `hsla(${hue}, ${sat + t * 10}%, ${lightness}%, ${alpha})`
}

function monoFill(count: number, maxCount: number, isDark: boolean): string {
  if (count === 0) {
    return isDark ? 'hsla(0, 0%, 50%, 0.05)' : 'hsla(0, 0%, 50%, 0.05)'
  }
  const intensity = Math.sqrt(count / maxCount)
  const alpha = 0.08 + intensity * 0.4
  return isDark ? `hsla(0, 0%, 65%, ${alpha})` : `hsla(0, 0%, 40%, ${alpha})`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(dateStr: string): string {
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

export function getTooltipText(date: string, count: number): string {
  const now = new Date()
  const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  if (date === today) return `Today, ${formatDate(date)} — contributions in progress`
  if (date > today) return 'No contributions (yet)'
  return `${count} contribution${count !== 1 ? 's' : ''} on ${formatDate(date)}`
}

interface GridCell {
  date: string
  count: number
  level: number
  inYear: boolean
}

function buildYearGrid(year: number): { grid: GridCell[][], totalContributions: number, maxCount: number, todayCoord: { week: number; day: number } | null, todayStr: string } {
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
  let maxCount = 0
  const current = new Date(gridStart)

  while (current <= gridEnd) {
    const week: GridCell[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = `${current.getFullYear()}-${pad2(current.getMonth() + 1)}-${pad2(current.getDate())}`
      const inYear = current.getFullYear() === year
      const contrib = lookup.get(dateStr)
      const count = contrib?.contributionCount ?? 0
      const level = contrib?.level ?? 0
      if (inYear) { total += count; if (count > maxCount) maxCount = count }
      week.push({ date: dateStr, count, level, inYear })
      current.setDate(current.getDate() + 1)
    }
    grid.push(week)
  }

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  let lastFilledWeek = 0
  for (let w = 0; w < grid.length; w++) {
    const week = grid[w]
    if (week?.some(cell => cell.date <= todayStr && cell.inYear)) {
      lastFilledWeek = w
    }
  }
  const trimmed = grid.slice(0, lastFilledWeek + 1)

  let todayCoord: { week: number; day: number } | null = null
  for (let w = 0; w < trimmed.length; w++) {
    const week = trimmed[w]
    if (!week) continue
    for (let d = 0; d < week.length; d++) {
      if (week[d]?.date === todayStr && week[d]?.inYear) {
        todayCoord = { week: w, day: d }
      }
    }
  }

  return { grid: trimmed, totalContributions: total, maxCount: maxCount || 1, todayCoord, todayStr }
}

interface TooltipState {
  text: string
  x: number
  y: number
}

const CURRENT_YEAR = new Date().getFullYear()

export type SparkPos = 'left' | 'right'
export type CollapseTransition = 'none' | 'drawer' | 'crossfade' | 'scatter' | 'height'

export function ContributionHeatmap({ displayMode = 'default', vizGap = 16, sparkPos = 'left', collapseTransition = 'none' }: { displayMode?: HeatmapMode; vizGap?: number; sparkPos?: SparkPos; collapseTransition?: CollapseTransition }) {
  const { grid, totalContributions, maxCount, todayCoord, todayStr } = useMemo(() => buildYearGrid(CURRENT_YEAR), [])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [focusedCell, setFocusedCell] = useState<{ week: number; day: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ week: number; day: number } | null>(null)
  const [isHoveringGrid, setIsHoveringGrid] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const hasExpandedOnce = useRef(false)
  const [scrollOpacity, setScrollOpacity] = useState(0.3)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const gridContentRef = useRef<HTMLDivElement>(null)
  const { bgIntensity, accentColor, resolvedAppearance } = useTheme()
  const { cursorMode } = useCursor()
  const { setHoveringLink } = useHover()
  const onLinkEnter = useCallback(() => setHoveringLink(true), [setHoveringLink])
  const onLinkLeave = useCallback(() => setHoveringLink(false), [setHoveringLink])
  const prefersReducedMotion = useReducedMotion()
  // Parent section uses gap:24; offset marginTop to achieve desired vizGap
  const marginOffset = vizGap - 24
  const hue = ACCENT_HUES[accentColor] ?? 34
  const isDark = resolvedAppearance === 'dark'

  // Scroll-fade: intersection observer
  useEffect(() => {
    if (displayMode !== 'scroll-fade') { setScrollOpacity(1); return }
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setScrollOpacity(0.3 + entry.intersectionRatio * 0.7)
        }
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 19) },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [displayMode])

  // Reset expanded state when mode changes away from collapsed
  useEffect(() => {
    if (displayMode !== 'collapsed') setIsExpanded(false)
  }, [displayMode])

  const cellFills = useMemo(() => {
    if (displayMode === 'mono') {
      return grid.map((week, weekIdx) =>
        week.map((cell, dayIdx) => {
          // Bloom: hovered cell + neighbors get accent color
          if (hoveredCell &&
              Math.abs(hoveredCell.week - weekIdx) <= 1 &&
              Math.abs(hoveredCell.day - dayIdx) <= 1) {
            return contribFill(cell.count, maxCount, hue, bgIntensity, isDark)
          }
          return monoFill(cell.count, maxCount, isDark)
        })
      )
    }
    if (displayMode === 'mono-all') {
      if (isHoveringGrid) {
        return grid.map(week =>
          week.map(cell => contribFill(cell.count, maxCount, hue, bgIntensity, isDark))
        )
      }
      return grid.map(week =>
        week.map(cell => monoFill(cell.count, maxCount, isDark))
      )
    }
    return grid.map(week =>
      week.map(cell => contribFill(cell.count, maxCount, hue, bgIntensity, isDark))
    )
  }, [grid, maxCount, hue, bgIntensity, isDark, displayMode, hoveredCell, isHoveringGrid])

  const monthLabels = useMemo(() => {
    const jan1 = new Date(CURRENT_YEAR, 0, 1)
    const gridStartDay = new Date(CURRENT_YEAR, 0, 1 - jan1.getDay())
    const labels: { month: string; col: number }[] = []
    const maxCol = grid.length - 1

    for (let m = 0; m < 12; m++) {
      const firstOfMonth = new Date(CURRENT_YEAR, m, 1)
      const daysDiff = Math.floor((firstOfMonth.getTime() - gridStartDay.getTime()) / (86400000))
      const col = Math.floor(daysDiff / 7)
      if (col > maxCol) break
      labels.push({ month: MONTHS[m] ?? '', col })
    }
    return labels
  }, [grid.length])

  // Weekly totals for sparkline/collapsed modes
  const weeklyTotals = useMemo(() => {
    return grid.map(week => week.reduce((sum, cell) => sum + (cell.inYear ? cell.count : 0), 0))
  }, [grid])
  const maxWeekly = useMemo(() => Math.max(...weeklyTotals, 1), [weeklyTotals])

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

    let week: number, day: number
    const target = e.target as SVGElement
    const weekAttr = target.getAttribute('data-week')
    const dayAttr = target.getAttribute('data-day')

    if (weekAttr !== null && dayAttr !== null) {
      week = parseInt(weekAttr)
      day = parseInt(dayAttr)
    } else {
      const ctm = svg.getScreenCTM()
      if (!ctm) { setTooltip(null); setHoveredCell(null); return }
      const svgX = (e.clientX - ctm.e) / ctm.a
      const svgY = (e.clientY - ctm.f) / ctm.d
      if (svgY < -CELL_SIZE) {
        setTooltip(null); setHoveredCell(null); return
      }
      week = Math.max(0, Math.min(grid.length - 1, Math.round((svgX - CELL_SIZE / 2) / CELL_STEP)))
      day = Math.max(0, Math.min(6, Math.round((svgY - CELL_SIZE / 2) / CELL_STEP)))
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
    setIsHoveringGrid(false)
  }, [])

  const handleMouseEnterSvg = useCallback(() => {
    setIsHoveringGrid(true)
  }, [])

  if (grid.length === 0) return null

  const cols = grid.length
  const rows = 7
  const gridWidth = cols * CELL_STEP - CELL_GAP
  const gridHeight = rows * CELL_STEP - CELL_GAP
  const svgWidth = gridWidth
  const svgHeight = gridHeight

  // --- SPARKLINE MODE ---
  if (displayMode === 'sparkline') {
    const barWidth = 2
    const barGap = 1
    const sparkHeight = 24
    const sparkWidth = weeklyTotals.length * (barWidth + barGap) - barGap
    return (
      <section
        ref={sectionRef}
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}
      >
        <svg width={sparkWidth} height={sparkHeight} style={{ display: 'block', flexShrink: 0 }}>
          {weeklyTotals.map((total, i) => {
            const h = Math.max(1, (total / maxWeekly) * (sparkHeight - 2))
            return (
              <rect
                key={i}
                x={i * (barWidth + barGap)}
                y={sparkHeight - h}
                width={barWidth}
                height={h}
                rx={0.5}
                fill={contribFill(total, maxWeekly, hue, bgIntensity, isDark)}
              />
            )
          })}
        </svg>
        <span style={{
          fontFamily: "'Onest', sans-serif",
          fontSize: 'var(--text-size-small)',
          fontWeight: 400,
          color: 'var(--text-grey)',
        }}>
          {totalContributions} GitHub contributions in {CURRENT_YEAR}
        </span>
      </section>
    )
  }

  // --- FULL HEATMAP (used by default, mono, mono-all, glass, inset, scroll-fade, collapsed) ---
  const headerRow = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: "'Onest', sans-serif",
        fontSize: 'var(--text-size-small)',
        fontWeight: 400,
        color: 'var(--text-grey)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <code style={{
          fontFamily: "'Onest', sans-serif",
          fontSize: 'inherit',
          fontWeight: 500,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          padding: '2px 6px',
          borderRadius: 4,
          fontVariantNumeric: 'tabular-nums',
        }}>{totalContributions}</code> GitHub contributions in {CURRENT_YEAR}
      </span>
      <a
        href="https://github.com/byamron"
        target="_blank"
        rel="noopener noreferrer"
        data-link-card
        data-border-radius="8"
        onMouseEnter={onLinkEnter}
        onMouseLeave={onLinkLeave}
        onFocus={onLinkEnter}
        onBlur={onLinkLeave}
        style={{
          fontFamily: "'Onest', sans-serif",
          fontSize: 'var(--text-size-small)',
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
  )

  const useTransition = displayMode === 'mono-all'

  const svgContent = (
    <div
      ref={containerRef}
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
        aria-label={`GitHub contribution graph: ${totalContributions} contributions in ${CURRENT_YEAR}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnterSvg}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        {grid.map((week, weekIdx) =>
          week.map((cell, dayIdx) => {
            if (!cell.inYear) return null
            return (
              <rect
                key={cell.date}
                x={weekIdx * CELL_STEP}
                y={dayIdx * CELL_STEP}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                style={{
                  fill: cellFills[weekIdx]?.[dayIdx],
                  transition: useTransition ? 'fill 0.4s ease' : undefined,
                }}
                data-date={cell.date}
                data-count={cell.count}
                data-week={weekIdx}
                data-day={dayIdx}
              />
            )
          })
        )}

        {/* Today indicator — inset border so it's visible even at 0 contributions */}
        {todayCoord && (
          <rect
            x={todayCoord.week * CELL_STEP + 1}
            y={todayCoord.day * CELL_STEP + 1}
            width={CELL_SIZE - 2}
            height={CELL_SIZE - 2}
            rx={1.5}
            fill="none"
            stroke={isDark ? `hsla(${hue}, 50%, 65%, 0.6)` : `hsla(${hue}, 55%, 40%, 0.5)`}
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Mouse hover highlight (standard/figpal cursor modes only) */}
        {cursorMode !== 'invert' && hoveredCell && grid[hoveredCell.week]?.[hoveredCell.day]?.inYear && (
          <rect
            x={hoveredCell.week * CELL_STEP}
            y={hoveredCell.day * CELL_STEP}
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
            y={focusedCell.day * CELL_STEP - 1}
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
      {/* Screen reader announcements */}
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
      {tooltip && (() => {
        const containerWidth = containerRef.current?.offsetWidth ?? Infinity
        const nearLeft = tooltip.x < 80
        const nearRight = tooltip.x > containerWidth - 80
        const left = nearLeft ? 0 : nearRight ? containerWidth : tooltip.x
        const transform = nearLeft
          ? 'translate(0, -100%)'
          : nearRight
            ? 'translate(-100%, -100%)'
            : 'translate(-50%, -100%)'
        return (
          <div
            style={{
              position: 'absolute',
              left,
              top: tooltip.y - 8,
              transform,
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 'var(--text-size-small)',
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
        )
      })()}
      {/* Month labels below the grid */}
      <div style={{ position: 'relative', height: LABEL_HEIGHT, pointerEvents: 'none' }}>
        {monthLabels.map(({ month, col }) => (
          <span
            key={month}
            style={{
              position: 'absolute',
              left: `${(col * CELL_STEP / svgWidth) * 100}%`,
              top: 4,
              fontSize: 'var(--text-size-small)',
              fontFamily: "'Onest', sans-serif",
              color: 'var(--text-grey)',
              whiteSpace: 'nowrap',
            }}
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  )

  const innerContent = (
    <>
      {headerRow}
      {svgContent}
    </>
  )

  // --- CONTAINER WRAPPERS ---

  // Glass card
  if (displayMode === 'glass') {
    return (
      <section
        ref={sectionRef}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', marginTop: marginOffset }}
      >
        <div style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {innerContent}
        </div>
      </section>
    )
  }

  // Subtle inset
  if (displayMode === 'inset') {
    return (
      <section
        ref={sectionRef}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', marginTop: marginOffset }}
      >
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {innerContent}
        </div>
      </section>
    )
  }

  // Scroll-fade
  if (displayMode === 'scroll-fade') {
    return (
      <section
        ref={sectionRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          marginTop: marginOffset,
          opacity: scrollOpacity,
          transition: 'opacity 0.4s ease',
        }}
      >
        {innerContent}
      </section>
    )
  }

  // --- COLLAPSED MODE (unified: collapsed ↔ expanded with animations) ---
  if (displayMode === 'collapsed') {
    const barWidth = 2
    const barGap = 1
    const sparkHeight = 14
    const sparkWidth = weeklyTotals.length * (barWidth + barGap) - barGap
    const sparkSvg = (
      <svg width={sparkWidth} height={sparkHeight} style={{ display: 'block', flexShrink: 0, position: 'absolute', top: 0, transform: `translateY(-${sparkHeight - 2}px)` }}>
        {weeklyTotals.map((total, i) => {
          const h = Math.max(1, (total / maxWeekly) * (sparkHeight - 2))
          return (
            <rect
              key={i}
              x={i * (barWidth + barGap)}
              y={sparkHeight - h}
              width={barWidth}
              height={h}
              rx={0.5}
              fill={contribFill(total, maxWeekly, hue, bgIntensity, isDark)}
            />
          )
        })}
      </svg>
    )
    const sparkDuration = prefersReducedMotion || collapseTransition === 'none' ? 0 : 0.25

    // Animation variants for the expandable grid content
    // When reduced motion is preferred, all durations collapse to 0 (instant show/hide)
    const gridAnimations: Record<CollapseTransition, { initial: Record<string, unknown>; animate: Record<string, unknown>; exit: Record<string, unknown> }> = prefersReducedMotion ? {
      none: { initial: {}, animate: {}, exit: {} },
      drawer: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } },
      crossfade: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } },
      scatter: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } },
      height: { initial: { height: 0 }, animate: { height: 'auto', transition: { duration: 0 } }, exit: { height: 0, transition: { duration: 0 } } },
    } : {
      none: { initial: {}, animate: {}, exit: {} },
      drawer: {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1, transition: { height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.25, delay: 0.15 } } },
        exit: { height: 0, opacity: 0, transition: { opacity: { duration: 0.15 }, height: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 } } },
      },
      crossfade: {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1, transition: { height: { duration: 0.45, ease: 'easeOut' }, opacity: { duration: 0.35, delay: 0.15 } } },
        exit: { height: 0, opacity: 0, transition: { opacity: { duration: 0.2 }, height: { duration: 0.35, ease: 'easeOut', delay: 0.1 } } },
      },
      scatter: {
        initial: { height: 0, opacity: 0, scale: 0.96 },
        animate: { height: 'auto', opacity: 1, scale: 1, transition: { height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3, delay: 0.12 }, scale: { duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } },
        exit: { height: 0, opacity: 0, scale: 0.96, transition: { opacity: { duration: 0.15 }, scale: { duration: 0.2 }, height: { duration: 0.3, delay: 0.1 } } },
      },
      height: {
        initial: { height: 0 },
        animate: { height: 'auto', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        exit: { height: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      },
    }
    const anim = gridAnimations[collapseTransition]

    const githubFooter = (
      <div style={{
        alignSelf: 'flex-start',
        fontFamily: "'Onest', sans-serif",
        fontSize: 'var(--text-size-small)',
        fontWeight: 400,
        color: 'var(--text-grey)',
      }}>
        <a
          href="https://github.com/byamron"
          target="_blank"
          rel="noopener noreferrer"
          data-link-card
          data-border-radius="8"
          onMouseEnter={onLinkEnter}
          onMouseLeave={onLinkLeave}
          onFocus={onLinkEnter}
          onBlur={onLinkLeave}
          style={{
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
        {' — Most repos are private (sorry).'}
      </div>
    )

    return (
      <section ref={sectionRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', marginTop: marginOffset }}>
        <div
          style={{
            padding: '20px 24px',
            margin: '0 -24px',
            borderRadius: 16,
            background: isExpanded
              ? (isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)')
              : 'transparent',
            transition: 'background 0.3s',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header row — click to toggle collapsed/expanded */}
          <button
            onClick={() => { if (!isExpanded) hasExpandedOnce.current = true; setIsExpanded(v => !v) }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isExpanded) { const outer = e.currentTarget.parentElement; if (outer) outer.style.background = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)' } }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!isExpanded) { const outer = e.currentTarget.parentElement; if (outer) outer.style.background = 'transparent' } }}
            style={{ display: 'flex', alignItems: 'baseline', gap: 12, cursor: 'pointer', width: '100%', background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textAlign: 'left' }}
          >
            {sparkPos === 'left' && (
              <AnimatePresence>
                {!isExpanded && (
                  <motion.span
                    key="spark-l"
                    initial={hasExpandedOnce.current ? { opacity: 0, width: 0 } : false}
                    animate={{ opacity: 1, width: sparkWidth, transition: { duration: sparkDuration } }}
                    exit={{ opacity: 0, width: 0, transition: { duration: sparkDuration } }}
                    style={{ position: 'relative', flexShrink: 0, height: 0, clipPath: 'inset(-20px 0)' }}
                  >
                    {sparkSvg}
                  </motion.span>
                )}
              </AnimatePresence>
            )}

            <span style={{
              fontFamily: "'Onest', sans-serif",
              fontSize: 'var(--text-size-small)',
              fontWeight: 400,
              color: 'var(--text-grey)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}>
              <code style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 'inherit',
                fontWeight: 400,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                padding: '2px 6px',
                borderRadius: 4,
              }}>{totalContributions}</code> GitHub contributions in {CURRENT_YEAR}
            </span>

            {sparkPos === 'right' && (
              <AnimatePresence>
                {!isExpanded && (
                  <motion.span
                    key="spark-r"
                    initial={hasExpandedOnce.current ? { opacity: 0, width: 0 } : false}
                    animate={{ opacity: 1, width: sparkWidth, transition: { duration: sparkDuration } }}
                    exit={{ opacity: 0, width: 0, transition: { duration: sparkDuration } }}
                    style={{ position: 'relative', flexShrink: 0, height: 0, clipPath: 'inset(-20px 0)' }}
                  >
                    {sparkSvg}
                  </motion.span>
                )}
              </AnimatePresence>
            )}

            {/* Right side: View activity (collapsed) ↔ Collapse (expanded) in same position */}
            <span style={{
              fontFamily: "'Onest', sans-serif",
              fontSize: 'var(--text-size-small)',
              fontWeight: 400,
              color: 'var(--text-grey)',
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {isExpanded ? 'Collapse' : 'View activity'}
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ display: 'block', transform: isExpanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.25s ease' }}>
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {/* Expandable grid content */}
          {collapseTransition === 'none' ? (
            isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
                {svgContent}
                {githubFooter}
              </div>
            )
          ) : (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="grid"
                  ref={gridContentRef}
                  initial={anim.initial}
                  animate={anim.animate}
                  exit={anim.exit}
                  style={{ overflow: 'hidden', transformOrigin: 'top center' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
                    {svgContent}
                    {githubFooter}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    )
  }

  // Default, mono, mono-all
  return (
    <section
      ref={sectionRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', marginTop: marginOffset }}
    >
      {innerContent}
    </section>
  )
}
