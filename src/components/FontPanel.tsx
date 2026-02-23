import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FontOption {
  family: string
  category: 'sans-serif' | 'serif'
  weights: number[]
}

interface FontConfig {
  headingFont: string
  bodyFont: string
  headingWeight: number
  bodyWeight: number
  headingSize: number
  bodySize: number
  headingLineHeight: number
  bodyLineHeight: number
}

// ---------------------------------------------------------------------------
// Font lists
// ---------------------------------------------------------------------------

const HEADING_FONTS: FontOption[] = [
  { family: 'Newsreader', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Literata', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Source Serif 4', category: 'serif', weights: [300, 400, 500, 600, 700] },
]

const BODY_FONTS: FontOption[] = [
  { family: 'Manrope', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Onest', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { family: 'Urbanist', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
]

const ALL_FONTS = [...new Map([...HEADING_FONTS, ...BODY_FONTS].map(f => [f.family, f])).values()]

const DEFAULTS: FontConfig = {
  headingFont: 'Literata',
  bodyFont: 'Onest',
  headingWeight: 300,
  bodyWeight: 400,
  headingSize: 36,
  bodySize: 18,
  headingLineHeight: 1.2,
  bodyLineHeight: 1.2,
}

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

const loadedFonts = new Set<string>()

function loadGoogleFont(family: string, weights: number[]): Promise<void> {
  if (loadedFonts.has(family)) return Promise.resolve()
  const id = `font-panel-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) {
    loadedFonts.add(family)
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.setAttribute('data-font-panel', family)
    const encoded = family.replace(/\s+/g, '+')
    const wStr = weights.join(';')
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${wStr}&display=swap`
    link.onload = () => { loadedFonts.add(family); resolve() }
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
}

// ---------------------------------------------------------------------------
// CSS override injection
// ---------------------------------------------------------------------------

function getFallback(family: string): string {
  return ALL_FONTS.find(f => f.family === family)?.category ?? 'sans-serif'
}

function applyFontOverrides(config: FontConfig) {
  let el = document.getElementById('font-panel-overrides') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'font-panel-overrides'
    document.head.appendChild(el)
  }

  el.textContent = `
    /* Font Panel overrides — dev only */
    body {
      font-family: '${config.bodyFont}', ${getFallback(config.bodyFont)} !important;
      font-weight: ${config.bodyWeight} !important;
    }
    h1, h2, h3 {
      font-family: '${config.headingFont}', ${getFallback(config.headingFont)} !important;
      font-weight: ${config.headingWeight} !important;
      font-size: ${config.headingSize}px !important;
      line-height: ${config.headingLineHeight} !important;
    }
    p, a, span, li, [data-link-card] {
      font-family: '${config.bodyFont}', ${getFallback(config.bodyFont)} !important;
      font-weight: ${config.bodyWeight} !important;
      font-size: ${config.bodySize}px !important;
      line-height: ${config.bodyLineHeight} !important;
    }
    /* Exclude the panel itself */
    [data-font-panel-root],
    [data-font-panel-root] * {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    }
  `
}

function clearFontOverrides() {
  document.getElementById('font-panel-overrides')?.remove()
}

// ---------------------------------------------------------------------------
// Layout override injection
// ---------------------------------------------------------------------------

const LAYOUT_DEFAULTS = { contentMaxWidth: 480, imageMaxWidth: 528 }

function applyLayoutOverrides(contentMaxWidth: number, imageMaxWidth: number) {
  let el = document.getElementById('layout-panel-overrides') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'layout-panel-overrides'
    document.head.appendChild(el)
  }
  el.textContent = `
    /* Layout Panel overrides — dev only */
    .left-column > div {
      max-width: ${contentMaxWidth}px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    .right-column [aria-live] {
      max-width: ${imageMaxWidth}px !important;
      width: 100% !important;
    }
  `
}

function clearLayoutOverrides() {
  document.getElementById('layout-panel-overrides')?.remove()
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const SYS_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const s = {
  root: {
    position: 'fixed' as const,
    bottom: 56,
    right: 16,
    zIndex: 9998,
    width: 300,
    maxHeight: 'calc(100vh - 80px)',
    overflowY: 'auto' as const,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 14,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    fontFamily: SYS_FONT,
    fontSize: 12,
    color: '#ccc',
  },
  toggleBtn: {
    position: 'fixed' as const,
    bottom: 16,
    right: 120,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    fontFamily: SYS_FONT,
    fontSize: 11,
    fontWeight: 500,
    color: '#999',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    lineHeight: 1,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #333',
  },
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    fontFamily: SYS_FONT,
    background: active ? '#2a2a2a' : 'transparent',
    color: active ? '#ccc' : '#666',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    transition: 'all 120ms ease',
  }),
  content: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: '#666',
    marginBottom: 6,
    fontFamily: SYS_FONT,
  },
  fontToggleGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  fontToggle: (active: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    borderRadius: 6,
    border: active ? '1px solid #3b82f6' : '1px solid #333',
    background: active ? 'rgba(59,130,246,0.15)' : '#111',
    color: active ? '#93bbfc' : '#888',
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1.3,
    transition: 'all 120ms ease',
    fontFamily: SYS_FONT,
  }),
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    accentColor: '#3b82f6',
    height: 4,
    cursor: 'pointer',
  },
  value: {
    fontSize: 11,
    color: '#999',
    fontVariantNumeric: 'tabular-nums' as const,
    minWidth: 32,
    textAlign: 'right' as const,
    fontFamily: SYS_FONT,
  },
  resetBtn: {
    padding: '4px 8px',
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: 4,
    color: '#888',
    fontSize: 10,
    cursor: 'pointer',
    fontFamily: SYS_FONT,
  },
  actionBtn: (color: string): React.CSSProperties => ({
    padding: '6px 12px',
    background: color,
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: SYS_FONT,
    transition: 'background 200ms ease',
  }),
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Tab = 'fonts' | 'scale' | 'layout' | 'info'

export function FontPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('fonts')
  const [config, setConfig] = useState<FontConfig>({ ...DEFAULTS })
  const [contentMaxWidth, setContentMaxWidth] = useState(LAYOUT_DEFAULTS.contentMaxWidth)
  const [imageMaxWidth, setImageMaxWidth] = useState(LAYOUT_DEFAULTS.imageMaxWidth)
  const [copySuccess, setCopySuccess] = useState(false)

  // Apply overrides whenever config changes
  useEffect(() => {
    if (isOpen) applyFontOverrides(config)
  }, [config, isOpen])

  // Apply layout overrides
  useEffect(() => {
    if (isOpen) applyLayoutOverrides(contentMaxWidth, imageMaxWidth)
  }, [contentMaxWidth, imageMaxWidth, isOpen])

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      clearFontOverrides()
      clearLayoutOverrides()
    }
  }, [isOpen])

  // Keyboard shortcut: Cmd+Shift+T
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Preload all fonts when panel first opens
  const hasPreloaded = useRef(false)
  useEffect(() => {
    if (isOpen && !hasPreloaded.current) {
      hasPreloaded.current = true
      ALL_FONTS.forEach(f => loadGoogleFont(f.family, f.weights))
    }
  }, [isOpen])

  const selectHeadingFont = useCallback(async (family: string) => {
    const font = ALL_FONTS.find(f => f.family === family)
    if (font) await loadGoogleFont(family, font.weights)
    setConfig(prev => ({ ...prev, headingFont: family }))
  }, [])

  const selectBodyFont = useCallback(async (family: string) => {
    const font = ALL_FONTS.find(f => f.family === family)
    if (font) await loadGoogleFont(family, font.weights)
    setConfig(prev => ({ ...prev, bodyFont: family }))
  }, [])

  const resetAll = useCallback(() => {
    setConfig({ ...DEFAULTS })
    setContentMaxWidth(LAYOUT_DEFAULTS.contentMaxWidth)
    setImageMaxWidth(LAYOUT_DEFAULTS.imageMaxWidth)
    clearFontOverrides()
    clearLayoutOverrides()
  }, [])

  const copyCSS = useCallback(() => {
    const css = [
      `/* Heading */`,
      `font-family: '${config.headingFont}', ${getFallback(config.headingFont)};`,
      `font-weight: ${config.headingWeight};`,
      `font-size: ${config.headingSize}px;`,
      `line-height: ${config.headingLineHeight};`,
      ``,
      `/* Body */`,
      `font-family: '${config.bodyFont}', ${getFallback(config.bodyFont)};`,
      `font-weight: ${config.bodyWeight};`,
      `font-size: ${config.bodySize}px;`,
      `line-height: ${config.bodyLineHeight};`,
    ].join('\n')
    navigator.clipboard.writeText(css).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }, [config])

  const isDefault = (key: keyof FontConfig) => config[key] === DEFAULTS[key]
  const update = (key: keyof FontConfig, v: number) => setConfig(prev => ({ ...prev, [key]: v }))

  return (
    <div data-font-panel-root>
      {/* Toggle button */}
      <button
        style={s.toggleBtn}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close font panel' : 'Open font panel'}
      >
        <svg width="14" height="14" viewBox="0 0 256 256" fill="none">
          <path
            d="M128 56v144M96 88h64M80 200h96"
            stroke="#999"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isOpen ? 'Close' : 'Type'}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={s.root}
            data-font-panel-root
          >
            {/* Tab bar */}
            <div style={s.tabBar}>
              {(['fonts', 'scale', 'layout', 'info'] as Tab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={s.tab(activeTab === tab)}>
                  {tab}
                </button>
              ))}
            </div>

            <div style={s.content}>
              {/* ---- FONTS TAB ---- */}
              {activeTab === 'fonts' && (
                <>
                  {/* Heading font toggle */}
                  <div>
                    <div style={s.label}>Heading</div>
                    <div style={s.fontToggleGroup}>
                      {HEADING_FONTS.map(font => (
                        <button
                          key={font.family}
                          onClick={() => selectHeadingFont(font.family)}
                          style={{
                            ...s.fontToggle(config.headingFont === font.family),
                            fontFamily: `'${font.family}', ${font.category}`,
                          }}
                        >
                          {font.family}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body font toggle */}
                  <div>
                    <div style={s.label}>Body</div>
                    <div style={s.fontToggleGroup}>
                      {BODY_FONTS.map(font => (
                        <button
                          key={font.family}
                          onClick={() => selectBodyFont(font.family)}
                          style={{
                            ...s.fontToggle(config.bodyFont === font.family),
                            fontFamily: `'${font.family}', ${font.category}`,
                          }}
                        >
                          {font.family}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight sliders */}
                  <div>
                    <div style={s.label}>Heading weight</div>
                    <div style={s.sliderRow}>
                      <input
                        type="range" min={100} max={900} step={100}
                        value={config.headingWeight}
                        onChange={e => update('headingWeight', Number(e.target.value))}
                        style={s.slider}
                      />
                      <span style={s.value}>{config.headingWeight}</span>
                    </div>
                  </div>
                  <div>
                    <div style={s.label}>Body weight</div>
                    <div style={s.sliderRow}>
                      <input
                        type="range" min={100} max={900} step={100}
                        value={config.bodyWeight}
                        onChange={e => update('bodyWeight', Number(e.target.value))}
                        style={s.slider}
                      />
                      <span style={s.value}>{config.bodyWeight}</span>
                    </div>
                  </div>
                </>
              )}

              {/* ---- SCALE TAB ---- */}
              {activeTab === 'scale' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Heading size</div>
                      {!isDefault('headingSize') && (
                        <button style={s.resetBtn} onClick={() => update('headingSize', DEFAULTS.headingSize)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={20} max={72} step={1} value={config.headingSize}
                        onChange={e => update('headingSize', Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{config.headingSize}px</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Body size</div>
                      {!isDefault('bodySize') && (
                        <button style={s.resetBtn} onClick={() => update('bodySize', DEFAULTS.bodySize)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={12} max={28} step={1} value={config.bodySize}
                        onChange={e => update('bodySize', Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{config.bodySize}px</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Heading line-height</div>
                      {!isDefault('headingLineHeight') && (
                        <button style={s.resetBtn} onClick={() => update('headingLineHeight', DEFAULTS.headingLineHeight)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={0.8} max={2} step={0.05} value={config.headingLineHeight}
                        onChange={e => update('headingLineHeight', Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{config.headingLineHeight.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Body line-height</div>
                      {!isDefault('bodyLineHeight') && (
                        <button style={s.resetBtn} onClick={() => update('bodyLineHeight', DEFAULTS.bodyLineHeight)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={0.8} max={2} step={0.05} value={config.bodyLineHeight}
                        onChange={e => update('bodyLineHeight', Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{config.bodyLineHeight.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* ---- LAYOUT TAB ---- */}
              {activeTab === 'layout' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Content max-width</div>
                      {contentMaxWidth !== LAYOUT_DEFAULTS.contentMaxWidth && (
                        <button style={s.resetBtn} onClick={() => setContentMaxWidth(LAYOUT_DEFAULTS.contentMaxWidth)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={360} max={900} step={10} value={contentMaxWidth}
                        onChange={e => setContentMaxWidth(Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{contentMaxWidth}px</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={s.label}>Image max-width</div>
                      {imageMaxWidth !== LAYOUT_DEFAULTS.imageMaxWidth && (
                        <button style={s.resetBtn} onClick={() => setImageMaxWidth(LAYOUT_DEFAULTS.imageMaxWidth)}>Reset</button>
                      )}
                    </div>
                    <div style={s.sliderRow}>
                      <input type="range" min={300} max={800} step={10} value={imageMaxWidth}
                        onChange={e => setImageMaxWidth(Number(e.target.value))} style={s.slider} />
                      <span style={s.value}>{imageMaxWidth}px</span>
                    </div>
                  </div>
                </>
              )}

              {/* ---- INFO TAB ---- */}
              {activeTab === 'info' && (
                <>
                  <div style={{
                    background: '#111', borderRadius: 8, padding: 10,
                    fontSize: 11, lineHeight: 1.6, color: '#999', fontFamily: SYS_FONT,
                  }}>
                    <div>
                      <span style={{ color: '#666' }}>Heading: </span>
                      <span style={{ color: '#ccc' }}>{config.headingFont}</span>
                      <span style={{ color: '#666' }}> {config.headingWeight}</span>
                      <span style={{ color: '#555' }}> · {config.headingSize}px / {config.headingLineHeight}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Body: </span>
                      <span style={{ color: '#ccc' }}>{config.bodyFont}</span>
                      <span style={{ color: '#666' }}> {config.bodyWeight}</span>
                      <span style={{ color: '#555' }}> · {config.bodySize}px / {config.bodyLineHeight}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Content: </span>
                      <span style={{ color: '#555' }}>{contentMaxWidth}px</span>
                      <span style={{ color: '#666' }}> · Image: </span>
                      <span style={{ color: '#555' }}>{imageMaxWidth}px</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <div style={s.label}>Preview</div>
                    <div style={{ background: '#111', borderRadius: 8, padding: 12 }}>
                      <div style={{
                        fontFamily: `'${config.headingFont}', ${getFallback(config.headingFont)}`,
                        fontWeight: config.headingWeight,
                        fontSize: Math.min(config.headingSize, 28),
                        lineHeight: config.headingLineHeight,
                        color: '#ccc', marginBottom: 8,
                      }}>
                        Heading preview
                      </div>
                      <div style={{
                        fontFamily: `'${config.bodyFont}', ${getFallback(config.bodyFont)}`,
                        fontWeight: config.bodyWeight,
                        fontSize: Math.min(config.bodySize, 16),
                        lineHeight: config.bodyLineHeight,
                        color: '#888',
                      }}>
                        Body text preview. The quick brown fox jumps over the lazy dog.
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{ ...s.actionBtn(copySuccess ? '#22c55e' : '#3b82f6'), flex: 1 }}
                      onClick={copyCSS}
                    >
                      {copySuccess ? 'Copied!' : 'Copy CSS'}
                    </button>
                    <button
                      style={{ ...s.resetBtn, flex: 1, padding: '6px 12px' }}
                      onClick={resetAll}
                    >
                      Reset all
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
