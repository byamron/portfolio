import { useEffect } from 'react'

/**
 * Wrapper for playground demo pages.
 * Applies the scoped styles that playground demos expect (full viewport,
 * overflow hidden, system font stack) without polluting the portfolio's
 * global styles.
 *
 * Also injects the subset of @playground/global.css that some demos rely
 * on via className — `.demo-page` (flex-centered demo page used by
 * theme-sidebar) and `.safari-tint-strip` (Safari iOS toolbar tint
 * strips used by color-hold-pick). We can't import global.css directly
 * because it includes a universal `* { margin: 0; padding: 0 }` reset
 * and forces html/body/#root to 100vw/100vh — both would break the
 * portfolio's main, scrollable pages on next route change.
 *
 * Cleanup removes the injected styles so they don't leak past the
 * wrapper's lifetime.
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

    // Inject demo-page + safari-tint-strip rules from @playground/global.css.
    // Scoped via a <style> element that is removed on unmount.
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-playground-wrapper', '')
    styleEl.textContent = `
      .demo-page {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
      }
      .safari-tint-strip {
        position: fixed;
        left: 0;
        right: 0;
        width: 100%;
        height: 8px;
        background: var(--safari-tint, #0a0a0a);
        pointer-events: none;
        z-index: 1;
      }
      .safari-tint-strip--top { top: 0; }
      .safari-tint-strip--bottom { bottom: 0; }
    `
    document.head.appendChild(styleEl)

    return () => {
      html.style.overflow = origHtmlOverflow
      body.style.overflow = origBodyOverflow
      if (root) root.style.overflow = origRootOverflow
      body.style.fontFamily = origBodyFont
      body.style.background = origBodyBg
      styleEl.remove()
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  )
}
