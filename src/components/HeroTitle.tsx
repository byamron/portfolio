import { useCallback } from 'react'
import { useHover } from '@/contexts/HoverContext'

export function HeroTitle() {
  const { setHoveringLink, setHoveredLinkId } = useHover()
  const onEnter = useCallback(() => { setHoveringLink(true); setHoveredLinkId('mochi') }, [setHoveringLink, setHoveredLinkId])
  const onLeave = useCallback(() => { setHoveringLink(false); setHoveredLinkId(null) }, [setHoveringLink, setHoveredLinkId])

  return (
    <h1
      style={{
        fontSize: 'var(--text-size-title)',
        fontWeight: 300,
        lineHeight: 1.2,
        color: 'var(--text-dark)',
      }}
    >
      Ben Yamron is a product designer. Currently leading design for patient experiences at <a href="https://joinmochi.com/" target="_blank" rel="noopener noreferrer" data-link-card data-tight-bounds data-border-radius="8" style={{ display: 'inline-block', lineHeight: 1, verticalAlign: 'baseline', color: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--text-underline)', textUnderlineOffset: 4, padding: '4px 8px', margin: '0 -8px' }} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}>Mochi Health</a>.
    </h1>
  )
}
