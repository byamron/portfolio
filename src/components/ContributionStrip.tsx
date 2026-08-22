import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useHover } from '@/contexts/HoverContext'
import { buildContributionDays, contribFill, getTooltipText } from '@/utils/contributions'

// Geometry — fixed values, see core-docs/contribution-strip-spec.md §4
const CELL = 16
const GAP = 2
const STEP = CELL + GAP // 18px per day
const RADIUS = 2
const EDGE = 16
const HIT_PAD = 10
const PILL_PAD = 2
const PILL_RADIUS = RADIUS + PILL_PAD
const TIP_OFFSET = 8

const JUMP_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}

// Reads the live --accent-hue custom property rather than a hardcoded table —
// matches useGlassHighlight/SidebarThemeControls/FlockX/CustomCursor/CursorCompanion,
// so a retuned hue in theme.css can't silently drift out of sync here.
function readAccentHue(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
  return parseFloat(raw) || 34
}

interface Layout {
  marks: number[]
  svgWidth: number
}

export function ContributionStrip() {
  const { bgIntensity, resolvedAppearance } = useTheme()
  const { setHoveringLink } = useHover()
  const prefersReducedMotion = !!useReducedMotion()
  const [hue, setHue] = useState(readAccentHue)
  const isDark = resolvedAppearance === 'dark'

  // ThemeContext sets data-accent then dispatches 'theme-changed' — listening for
  // the event (rather than re-reading on an accentColor prop change) guarantees
  // the DOM attribute is already updated by the time we read it, regardless of
  // React effect ordering between this component and ThemeProvider.
  useEffect(() => {
    const onThemeChanged = () => setHue(readAccentHue())
    document.addEventListener('theme-changed', onThemeChanged)
    return () => document.removeEventListener('theme-changed', onThemeChanged)
  }, [])

  const { days, total, max, year, today } = useMemo(() => buildContributionDays(), [])
  const n = days.length

  const stripRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState(-1)
  const [focused, setFocused] = useState(-1)
  const [jumpVisible, setJumpVisible] = useState(false)
  const [jumpActive, setJumpActive] = useState(false) // hover/focus frost state
  const [layout, setLayout] = useState<Layout>({ marks: [], svgWidth: 0 })

  const selectedIndex = hovered >= 0 ? hovered : focused

  // ── Layout measurement ──────────────────────────────────────────────
  const measure = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const w = scroller.clientWidth
    const contentW = n * STEP - GAP
    const startX = EDGE + Math.max(0, w - EDGE * 2 - contentW)
    const svgWidth = Math.max(w, startX + contentW + EDGE)
    const marks = days.map((_, i) => startX + i * STEP)
    setLayout({ marks, svgWidth })
  }, [days, n])

  useLayoutEffect(() => {
    measure()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncJumpVisibility = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    const away = maxScroll > 1 && maxScroll - scroller.scrollLeft > 4
    setJumpVisible(prev => (prev === away ? prev : away))
  }, [])

  // Pin to today whenever the measured layout changes (mount + resize)
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || layout.marks.length === 0) return
    scroller.scrollLeft = scroller.scrollWidth
    syncJumpVisibility()
  }, [layout, syncJumpVisibility])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setHovered(-1)
        setFocused(-1)
        measure()
      }, 80)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
    }
  }, [measure])

  // ── Colour ───────────────────────────────────────────────────────────
  const fills = useMemo(
    () => days.map(d => contribFill(d.contributionCount, max, hue, bgIntensity, isDark)),
    [days, max, hue, bgIntensity, isDark],
  )
  const ringColor = isDark ? `hsla(${hue}, 50%, 65%, 0.6)` : `hsla(${hue}, 55%, 40%, 0.5)`
  const pillBg = `hsla(${hue}, 20%, ${isDark ? 55 : 40}%, ${isDark ? 0.12 : 0.08})`
  const pillShadow = isDark
    ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
    : 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)'
  const pillBorder = isDark
    ? '0.5px solid rgba(255, 255, 255, 0.12)'
    : '0.5px solid rgba(0, 0, 0, 0.08)'
  const jumpFrostBg = isDark ? `hsla(${hue}, 20%, 55%, 0.12)` : `hsla(${hue}, 20%, 40%, 0.08)`
  const jumpFrostBorder = isDark ? '0.5px solid rgba(255, 255, 255, 0.12)' : '0.5px solid rgba(0, 0, 0, 0.08)'

  // ── Glass pill — ported from setupControlPill() in SidebarThemeControls.tsx ──
  const pillState = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const pillRaf = useRef<number | null>(null)
  const pillLast = useRef(0)
  const pillShown = useRef(false)

  const applyPill = useCallback(() => {
    const el = pillRef.current
    if (!el) return
    el.style.transform = `translate(${pillState.current.x.toFixed(2)}px, ${pillState.current.y.toFixed(2)}px)`
  }, [])

  const pillLoop = useCallback((t: number) => {
    pillRaf.current = null
    if (!pillRef.current || !pillShown.current) return
    const dt = pillLast.current ? Math.min((t - pillLast.current) / 1000, 0.032) : 0.016
    pillLast.current = t
    const lr = 1 - Math.pow(0.8, dt * 60)
    const s = pillState.current
    s.x += (s.tx - s.x) * lr
    s.y += (s.ty - s.y) * lr
    const settled = Math.abs(s.x - s.tx) < 0.3 && Math.abs(s.y - s.ty) < 0.3
    if (settled) { s.x = s.tx; s.y = s.ty }
    applyPill()
    if (!settled) pillRaf.current = requestAnimationFrame(pillLoop)
  }, [applyPill])

  const showPillAt = useCallback((i: number) => {
    const el = pillRef.current
    const mark = layout.marks[i]
    if (!el || mark === undefined) return
    pillState.current.tx = mark - PILL_PAD
    pillState.current.ty = HIT_PAD - PILL_PAD
    if (!pillShown.current || prefersReducedMotion) {
      pillState.current.x = pillState.current.tx
      pillState.current.y = pillState.current.ty
      el.style.transition = 'none'
      applyPill()
      void el.offsetHeight
      pillShown.current = true
      el.style.transition = 'opacity 150ms ease'
      el.style.opacity = '1'
      pillLast.current = 0
      return
    }
    pillLast.current = 0
    if (pillRaf.current === null) pillRaf.current = requestAnimationFrame(pillLoop)
  }, [layout, prefersReducedMotion, applyPill, pillLoop])

  const hidePill = useCallback(() => {
    const el = pillRef.current
    if (!el || !pillShown.current) return
    pillShown.current = false
    if (pillRaf.current !== null) { cancelAnimationFrame(pillRaf.current); pillRaf.current = null }
    el.style.transition = 'opacity 150ms ease'
    el.style.opacity = '0'
  }, [])

  // ── Tooltip — same travel physics as the pill; text swaps immediately, the
  // container slides and resizes to follow. ──────────────────────────────
  const tipState = useRef({ x: 0, w: 0, tx: 0, tw: 0 })
  const tipRaf = useRef<number | null>(null)
  const tipLast = useRef(0)
  const tipShown = useRef(false)
  const tipIndex = useRef(-1)
  const tipY = useRef(0)

  const applyTip = useCallback(() => {
    const el = tipRef.current
    if (!el) return
    el.style.width = `${tipState.current.w.toFixed(2)}px`
    el.style.transform = `translate(${tipState.current.x.toFixed(2)}px, ${tipY.current}px) translateY(-100%)`
  }, [])

  const tipLoop = useCallback((t: number) => {
    tipRaf.current = null
    if (!tipShown.current) return
    const dt = tipLast.current ? Math.min((t - tipLast.current) / 1000, 0.032) : 0.016
    tipLast.current = t
    const lr = 1 - Math.pow(0.8, dt * 60)
    const s = tipState.current
    s.x += (s.tx - s.x) * lr
    s.w += (s.tw - s.w) * lr
    const settled = Math.abs(s.x - s.tx) < 0.3 && Math.abs(s.w - s.tw) < 0.3
    if (settled) { s.x = s.tx; s.w = s.tw }
    applyTip()
    if (!settled) tipRaf.current = requestAnimationFrame(tipLoop)
  }, [applyTip])

  const showTooltip = useCallback((i: number, snap: boolean) => {
    const tipEl = tipRef.current
    const scroller = scrollerRef.current
    const strip = stripRef.current
    const day = days[i]
    const mark = layout.marks[i]
    if (!tipEl || !scroller || !strip || !day || mark === undefined) return

    const text = getTooltipText(day.date, day.contributionCount, today)
    tipEl.textContent = text
    tipEl.style.width = 'auto'
    const w = tipEl.offsetWidth

    tipY.current = scroller.offsetTop - TIP_OFFSET
    const cx = mark + CELL / 2 - scroller.scrollLeft
    const x = Math.min(Math.max(cx - w / 2, 0), Math.max(0, strip.clientWidth - w))

    tipState.current.tx = x
    tipState.current.tw = w

    const sameDay = i === tipIndex.current && tipShown.current
    tipIndex.current = i
    if (!tipShown.current || sameDay || snap || prefersReducedMotion) {
      if (tipRaf.current !== null) { cancelAnimationFrame(tipRaf.current); tipRaf.current = null }
      tipState.current.x = x
      tipState.current.w = w
      applyTip()
      tipShown.current = true
      tipEl.style.transition = 'opacity 150ms ease'
      tipEl.style.opacity = '1'
    } else {
      tipLast.current = 0
      if (tipRaf.current === null) tipRaf.current = requestAnimationFrame(tipLoop)
    }
    if (liveRef.current) liveRef.current.textContent = text
  }, [days, layout, today, prefersReducedMotion, applyTip, tipLoop])

  const hideTooltip = useCallback(() => {
    if (tipRaf.current !== null) { cancelAnimationFrame(tipRaf.current); tipRaf.current = null }
    tipShown.current = false
    tipIndex.current = -1
    const el = tipRef.current
    if (el) { el.style.transition = 'opacity 150ms ease'; el.style.opacity = '0' }
    if (liveRef.current) liveRef.current.textContent = ''
  }, [])

  // Drive pill + tooltip from the selection (hover takes priority over focus)
  useEffect(() => {
    if (selectedIndex < 0) {
      hidePill()
      hideTooltip()
      return
    }
    showPillAt(selectedIndex)
    showTooltip(selectedIndex, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, layout])

  useEffect(() => () => {
    if (pillRaf.current !== null) cancelAnimationFrame(pillRaf.current)
    if (tipRaf.current !== null) cancelAnimationFrame(tipRaf.current)
  }, [])

  // ── Hit testing + scroll-into-view ──────────────────────────────────
  const indexAt = useCallback((clientX: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return 0
    const rect = scroller.getBoundingClientRect()
    const x = clientX - rect.left + scroller.scrollLeft
    const i = Math.floor((x - EDGE) / STEP)
    return Math.max(0, Math.min(n - 1, i))
  }, [n])

  const scrollIntoView = useCallback((i: number) => {
    const scroller = scrollerRef.current
    const mark = layout.marks[i]
    if (!scroller || mark === undefined) return
    const left = scroller.scrollLeft
    const right = left + scroller.clientWidth
    if (mark - EDGE < left) scroller.scrollLeft = mark - EDGE
    else if (mark + CELL + EDGE > right) scroller.scrollLeft = mark + CELL + EDGE - scroller.clientWidth
  }, [layout])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const i = indexAt(e.clientX)
    setHovered(prev => (prev === i ? prev : i))
  }, [indexAt])

  const handleMouseLeave = useCallback(() => setHovered(-1), [])

  const handleFocus = useCallback(() => {
    setFocused(prev => (prev < 0 ? n - 1 : prev))
  }, [n])

  const handleBlur = useCallback(() => setFocused(-1), [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setFocused(-1); return }
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1
      : e.key === 'ArrowUp' ? 7 : e.key === 'ArrowDown' ? -7 : 0
    if (!delta) return
    e.preventDefault()
    const base = focused < 0 ? n - 1 : focused
    const next = Math.min(n - 1, Math.max(0, base + delta))
    scrollIntoView(next)
    setHovered(-1)
    setFocused(next)
  }, [focused, n, scrollIntoView])

  const handleScroll = useCallback(() => {
    syncJumpVisibility()
    if (selectedIndex >= 0) showTooltip(selectedIndex, true)
  }, [selectedIndex, showTooltip, syncJumpVisibility])

  // ── Jump to today ────────────────────────────────────────────────────
  const jumpRaf = useRef<number | null>(null)

  const jumpToToday = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    if (jumpRaf.current !== null) { cancelAnimationFrame(jumpRaf.current); jumpRaf.current = null }
    const from = scroller.scrollLeft
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    const dist = maxScroll - from
    if (dist <= 0) return
    if (prefersReducedMotion) {
      scroller.scrollLeft = maxScroll
      syncJumpVisibility()
      return
    }
    const duration = Math.min(700, Math.max(320, dist * 0.35))
    let start: number | null = null
    const step = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / duration)
      scroller.scrollLeft = from + dist * easeOutQuint(p)
      if (p < 1) {
        jumpRaf.current = requestAnimationFrame(step)
      } else {
        jumpRaf.current = null
        scroller.scrollLeft = maxScroll
        syncJumpVisibility()
      }
    }
    jumpRaf.current = requestAnimationFrame(step)
  }, [prefersReducedMotion, syncJumpVisibility])

  useEffect(() => () => {
    if (jumpRaf.current !== null) cancelAnimationFrame(jumpRaf.current)
  }, [])

  const onLinkEnter = useCallback(() => setHoveringLink(true), [setHoveringLink])
  const onLinkLeave = useCallback(() => setHoveringLink(false), [setHoveringLink])

  if (n === 0) return null

  const lastMark = layout.marks[n - 1] ?? 0
  const focusRingVisible = focused >= 0 && hovered < 0 && layout.marks[focused] !== undefined

  return (
    <section
      ref={stripRef}
      style={{ marginTop: 64, paddingBottom: 16 - HIT_PAD, position: 'relative' }}
    >
      <div
        style={{
          display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
          fontFamily: "'Onest', sans-serif", fontSize: 'var(--text-size-small)', lineHeight: 1.3,
          color: 'var(--text-grey)', paddingLeft: 40, marginBottom: 16 - HIT_PAD,
        }}
      >
        <span>
          <code style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 'inherit', fontVariantNumeric: 'tabular-nums',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4,
          }}>{total}</code>
          {' '}
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
              color: 'inherit', textDecoration: 'underline',
              textDecorationColor: 'var(--text-underline)', textUnderlineOffset: 3,
            }}
          >
            GitHub
          </a>
          {` contributions in ${year}`}
        </span>
        <button
          type="button"
          onClick={jumpToToday}
          onMouseEnter={() => setJumpActive(true)}
          onMouseLeave={() => setJumpActive(false)}
          onFocus={() => setJumpActive(true)}
          onBlur={() => setJumpActive(false)}
          aria-label="Scroll back to today"
          aria-hidden={!jumpVisible}
          tabIndex={jumpVisible ? 0 : -1}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            width: 18, height: 18, marginLeft: 6,
            font: 'inherit', fontSize: 14, lineHeight: 1, color: jumpActive ? 'var(--text-dark)' : 'var(--text-grey)',
            background: jumpActive ? jumpFrostBg : 'transparent',
            border: jumpActive ? jumpFrostBorder : '0.5px solid transparent',
            borderRadius: 6, cursor: 'pointer', padding: 0,
            opacity: jumpVisible ? 1 : 0,
            transform: jumpVisible ? 'translateX(0)' : 'translateX(-6px)',
            pointerEvents: jumpVisible ? 'auto' : 'none',
            boxShadow: jumpActive ? '0 0 0 2px var(--text-dark)' : 'none',
            transition: `opacity 200ms ${JUMP_EASE}, transform 200ms ${JUMP_EASE}, background 150ms ease, border-color 150ms ease, color 150ms ease`,
          }}
        >
          &rarr;
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="contribution-strip-scroll"
        data-glass-break
        tabIndex={0}
        role="img"
        aria-label={`Daily GitHub contributions in ${year}: ${total} total across ${n} days. Use arrow keys to step through days.`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        style={{
          position: 'relative', outline: 'none',
          padding: `${HIT_PAD}px 0`,
          overflowX: 'auto', overflowY: 'hidden',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
        }}
      >
        <div
          ref={pillRef}
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, boxSizing: 'border-box',
            pointerEvents: 'none', zIndex: 0, opacity: 0,
            width: CELL + PILL_PAD * 2, height: CELL + PILL_PAD * 2, borderRadius: PILL_RADIUS,
            background: pillBg, backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)',
            boxShadow: pillShadow, border: pillBorder,
            willChange: 'transform, opacity', contain: 'layout style',
          } as React.CSSProperties}
        />
        <svg
          width={layout.svgWidth}
          height={CELL}
          viewBox={`0 0 ${layout.svgWidth} ${CELL}`}
          overflow="visible"
          style={{ display: 'block', position: 'relative' }}
        >
          {days.map((d, i) => (
            <rect
              key={d.date}
              x={layout.marks[i]}
              y={0}
              width={CELL}
              height={CELL}
              rx={RADIUS}
              fill={fills[i]}
              data-date={d.date}
              data-index={i}
            />
          ))}
          <rect
            x={lastMark + 0.75}
            y={0.75}
            width={CELL - 1.5}
            height={CELL - 1.5}
            rx={Math.max(0, RADIUS - 0.5)}
            fill="none"
            stroke={ringColor}
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
          />
          {focusRingVisible && (
            <rect
              x={layout.marks[focused]! - PILL_PAD - 1.5}
              y={-PILL_PAD - 1.5}
              width={CELL + PILL_PAD * 2 + 3}
              height={CELL + PILL_PAD * 2 + 3}
              rx={PILL_RADIUS + 1.5}
              fill="none"
              stroke="var(--text-dark)"
              strokeWidth={1.5}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
      </div>

      <div
        ref={tipRef}
        style={{
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10,
          padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap', textAlign: 'center', overflow: 'hidden',
          fontFamily: "'Onest', sans-serif", fontSize: 'var(--text-size-small)', lineHeight: 1.3,
          color: 'var(--text-dark)', background: 'var(--bg)',
          border: '1px solid var(--text-light-grey)', boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          opacity: 0, willChange: 'transform, width, opacity',
        }}
      />

      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
          overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
        }}
      />
    </section>
  )
}
