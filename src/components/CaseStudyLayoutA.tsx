import { useRef, useEffect, useLayoutEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { CaseStudy, DecisionCategory } from '@/data/case-study-content'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useTypography } from '@/contexts/TypographyContext'

// Shared heading style — single source of truth for both narrow and wide layouts
const headingStyle = {
  fontSize: 'var(--text-size-title)',
  fontFamily: "'Literata', serif",
  fontWeight: 300,
  lineHeight: 1.2,
  color: 'var(--text-dark)',
  marginBottom: 32,
} as const

const categoryHeadingStyle = {
  fontSize: 'var(--text-size-section-heading)',
  fontFamily: "'Literata', serif",
  fontWeight: 300,
  lineHeight: 1.2,
  color: 'var(--text-dark)',
  marginBottom: 24,
} as const

const decisionTitleStyle = {
  fontSize: 'var(--text-size-body)',
  fontFamily: "'Onest', sans-serif",
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'var(--text-dark)',
  marginBottom: 6,
} as const

const decisionCaptionStyle = {
  fontSize: 'var(--text-size-caption)',
  fontFamily: "'Onest', sans-serif",
  fontWeight: 400,
  lineHeight: 1.5,
  color: 'var(--text-grey)',
} as const

const imagePlaceholderStyle = {
  width: '100%',
  aspectRatio: '4 / 3',
  borderRadius: 32,
  border: '1.5px dashed var(--text-light-grey)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  color: 'var(--text-light-grey)',
  fontSize: 'var(--text-size-small)',
  fontFamily: "'Onest', sans-serif",
} as const

const DECISION_CARD_WIDTH = 528

function DecisionsSection({ decisions }: { decisions: DecisionCategory[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
      {decisions.map((category) => (
        <section key={category.type}>
          <h2 style={{ ...categoryHeadingStyle, paddingLeft: 'var(--layout-margin)' }}>
            {category.heading}
          </h2>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 24,
              paddingLeft: 'var(--layout-margin)',
              paddingRight: 'var(--layout-margin)',
              paddingBottom: 16,
              scrollbarWidth: 'none',
            }}
          >
            {category.items.map((item) => (
              <div
                key={item.id}
                style={{
                  minWidth: DECISION_CARD_WIDTH,
                  maxWidth: DECISION_CARD_WIDTH,
                  flex: '0 0 auto',
                }}
              >
                <div style={imagePlaceholderStyle}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 32 }}
                    />
                  ) : (
                    <span>image / gif</span>
                  )}
                </div>
                <h3 style={decisionTitleStyle}>{item.title}</h3>
                <p style={decisionCaptionStyle}>{item.caption}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const contactCtaStyle = {
  fontSize: 'var(--text-size-caption)',
  lineHeight: 1.5,
  color: 'var(--text-grey)',
  marginTop: 32,
  fontFamily: "'Onest', sans-serif",
} as const

const DEFAULT_CONTACT_CTA =
  'Want more details? <a href="mailto:ben.yamron@icloud.com" data-contact-card data-border-radius="8" style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">Get in touch</a>.'

interface CaseStudyLayoutAProps {
  data: CaseStudy
  isNarrow: boolean
  previewImage?: string
  lottiePreview?: string
  videoPreview?: string
}

export function CaseStudyLayoutA({ data, isNarrow, previewImage, lottiePreview, videoPreview }: CaseStudyLayoutAProps) {
  const reducedMotion = useReducedMotion()
  const { narrativeStyle } = useTypography()
  const narrativeRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const hasDecisions = !!data.decisions?.length
  const hasMedia = !!(videoPreview || previewImage || lottiePreview)

  // Reparent the persistent RightColumn DOM element into the hero's sticky slot.
  // This preserves the exact same <video>/<img> element — no remount, no playback
  // reset, no flash. The element switches from position:fixed to position:sticky
  // so it's constrained to the hero section and scrolls away when the hero ends.
  // On cleanup (navigate away), move it back and restore fixed positioning.
  useLayoutEffect(() => {
    if (!hasDecisions || isNarrow) return

    const slot = slotRef.current
    const rightCol = document.querySelector('.right-column') as HTMLElement | null
    if (!slot || !rightCol) return

    const originalParent = rightCol.parentElement

    // Save original inline styles
    const saved = {
      position: rightCol.style.position,
      top: rightCol.style.top,
      right: rightCol.style.right,
      height: rightCol.style.height,
      width: rightCol.style.width,
      alignSelf: rightCol.style.alignSelf,
    }

    // Move into the hero slot
    slot.appendChild(rightCol)

    // Switch from fixed to sticky
    rightCol.style.position = 'sticky'
    rightCol.style.top = '0'
    rightCol.style.right = ''
    rightCol.style.width = '100%'
    rightCol.style.alignSelf = 'flex-start'

    return () => {
      // Move back to original parent, restore styles
      if (originalParent && rightCol.parentElement === slot) {
        originalParent.appendChild(rightCol)
      }
      rightCol.style.position = saved.position
      rightCol.style.top = saved.top
      rightCol.style.right = saved.right
      rightCol.style.height = saved.height
      rightCol.style.width = saved.width
      rightCol.style.alignSelf = saved.alignSelf
    }
  }, [hasDecisions, isNarrow])

  // Glass highlight for paper link cards and contact CTA within the narrative
  useGlassHighlight(narrativeRef, {
    borderRadius: 16,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-link-card], [data-contact-card]',
  })

  const { narrative, paperLinks } = data
  const contactCta = data.contactCta ?? DEFAULT_CONTACT_CTA

  // Narrow-only media element (wide layout uses the persistent RightColumn)
  const narrowMediaElement = isNarrow && hasMedia ? (
    videoPreview ? (
      <video
        src={videoPreview}
        autoPlay
        muted
        loop
        playsInline
        aria-label={data.title}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: data.id === 'sony-screenless-tv' ? 'cover' : 'contain',
          aspectRatio: data.id === 'sony-screenless-tv' ? '4 / 3' : undefined,
          borderRadius: 32,
        }}
      />
    ) : previewImage ? (
      <img
        src={previewImage}
        alt={data.title}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: 32,
        }}
      />
    ) : null
  ) : null

  // Text content — narrative paragraphs
  const textContent = (
    <>
      {narrative.map((html, i) => (
        <p
          key={i}
          style={{
            ...narrativeStyle,
            fontFamily: 'var(--cs-body-font, ' + narrativeStyle.fontFamily + ')',
            fontSize: 'var(--cs-body-size, ' + narrativeStyle.fontSize + ')',
            color: 'var(--cs-body-color, ' + narrativeStyle.color + ')',
            marginBottom: i < narrative.length - 1 ? 16 : 0,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </>
  )

  const paperLinksContent = paperLinks?.length ? (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {paperLinks.map((paper, i) => (
        <a
          key={i}
          href={paper.href}
          target="_blank"
          rel="noopener noreferrer"
          data-link-card
          style={{
            width: 'fit-content',
            alignSelf: 'flex-start',
            padding: '18px 16px',
            margin: '0 -16px',
            borderRadius: 16,
            fontSize: 'var(--text-size-body)',
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
            lineHeight: 1.4,
            color: 'var(--text-dark)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 4,
            border: '0.1px solid transparent',
          }}
        >
          {paper.title}{' '}
          <span aria-hidden="true" style={{ display: 'inline-block', width: '1em', textAlign: 'center', verticalAlign: 'text-top' }}>{'\u2192'}</span>
        </a>
      ))}
    </div>
  ) : null

  // --- Narrow layout ---
  if (isNarrow) {
    return (
      <article style={{ padding: 'calc(var(--layout-padding-top) + 48px) var(--layout-margin) var(--layout-padding-top)' }}>
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.15 }}
          style={{ position: 'relative' }}
        >
          <h1 style={headingStyle}>
            {data.title}
          </h1>

          {textContent}

          {paperLinksContent}

          {narrowMediaElement && (
            <div style={{ marginTop: 32 }}>
              {narrowMediaElement}
            </div>
          )}

          <p
            style={contactCtaStyle}
            dangerouslySetInnerHTML={{ __html: contactCta }}
          />
        </motion.div>

        {hasDecisions && (
          <div style={{ marginTop: 80, marginLeft: 'calc(-1 * var(--layout-margin))', marginRight: 'calc(-1 * var(--layout-margin))' }}>
            <DecisionsSection decisions={data.decisions!} />
          </div>
        )}
      </article>
    )
  }

  // --- Wide layout WITH decisions ---
  // Hero: flex row. Left 50% = text. Right 50% = empty slot that receives
  // the reparented RightColumn element (sticky, scrolls away with hero).
  if (hasDecisions) {
    return (
      <article>
        {/* Hero section — two-column, RightColumn reparented into the slot */}
        <div style={{ display: 'flex' }}>
          {/* Left: description text */}
          <div
            style={{
              width: '50%',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'calc(var(--layout-padding-top) + 48px) var(--layout-margin)',
            }}
          >
            <motion.div
              ref={narrativeRef}
              initial={{ opacity: reducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.15 }}
              style={{ position: 'relative' }}
            >
              <h1 style={headingStyle}>
                {data.title}
              </h1>

              {textContent}

              {paperLinksContent}

              <p
                style={contactCtaStyle}
                dangerouslySetInnerHTML={{ __html: contactCta }}
              />
            </motion.div>
          </div>

          {/* Right: slot for the reparented RightColumn */}
          <div ref={slotRef} style={{ width: '50%' }} />
        </div>

        {/* Decisions section — full width, horizontal scroll per category */}
        <div style={{ paddingTop: 40, paddingBottom: 80 }}>
          <DecisionsSection decisions={data.decisions!} />
        </div>
      </article>
    )
  }

  // --- Wide layout WITHOUT decisions: original left-column-only layout ---
  return (
    <article>
      <div
        style={{
          width: '50%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'calc(var(--layout-padding-top) + 48px) var(--layout-margin)',
        }}
      >
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.15 }}
          style={{ position: 'relative' }}
        >
          <h1 style={headingStyle}>
            {data.title}
          </h1>

          {textContent}

          {paperLinksContent}

          <p
            style={contactCtaStyle}
            dangerouslySetInnerHTML={{ __html: contactCta }}
          />
        </motion.div>
      </div>
    </article>
  )
}
