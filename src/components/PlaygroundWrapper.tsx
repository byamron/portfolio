import { useEffect } from 'react'

/**
 * Wrapper for playground demo pages.
 * Applies the scoped styles that playground demos expect (full viewport,
 * overflow hidden, system font stack) without polluting the portfolio's
 * global styles.
 */
export function PlaygroundWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    const body = document.body

    // Save originals
    const origHtmlOverflow = html.style.overflow
    const origBodyOverflow = body.style.overflow
    const origRootOverflow = root?.style.overflow ?? ''
    const origBodyFont = body.style.fontFamily
    const origBodyBg = body.style.background

    // Apply playground globals
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (root) root.style.overflow = 'hidden'
    body.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
    body.style.background = '#0a0a0a'

    return () => {
      html.style.overflow = origHtmlOverflow
      body.style.overflow = origBodyOverflow
      if (root) root.style.overflow = origRootOverflow
      body.style.fontFamily = origBodyFont
      body.style.background = origBodyBg
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  )
}
