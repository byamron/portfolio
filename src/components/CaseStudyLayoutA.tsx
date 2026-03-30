import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { CaseStudy } from '@/data/case-study-content'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { narrativeStyle } from '@/styles/shared'

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
  const narrativeRef = useRef<HTMLDivElement>(null)

  // Glass highlight for paper link cards and contact CTA within the narrative
  useGlassHighlight(narrativeRef, {
    borderRadius: 16,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-link-card], [data-contact-card]',
  })

  const hasMedia = !!(videoPreview || previewImage || lottiePreview)

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

  // Text content — narrative paragraphs or subtitle fallback
  const textContent = (
    <>
      <style>{`
        .cs-narrative strong {
          color: var(--cs-strong-color, var(--text-dark));
          font-weight: var(--cs-strong-weight, 300);
        }
      `}</style>
      {narrative.map((html, i) => (
        <p
          key={i}
          className="cs-narrative"
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
            padding: '24px 16px',
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

  if (isNarrow) {
    return (
      <article style={{ padding: 'calc(var(--cs-top-padding, var(--layout-padding-top)) + 32px) var(--layout-margin) var(--layout-padding-top)' }}>
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{ position: 'relative' }}
        >
          <h1
            style={{
              fontSize: 'var(--cs-heading-size, var(--text-size-section-heading))',
              fontFamily: "'Literata', serif",
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              marginBottom: 'var(--cs-heading-spacing, 24px)',
            }}
          >
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
            style={{
              fontSize: 'var(--text-size-caption)',
              lineHeight: 1.5,
              color: 'var(--text-grey)',
              marginTop: 32,
              fontFamily: "'Onest', sans-serif",
            }}
            dangerouslySetInnerHTML={{ __html: contactCta }}
          />
        </motion.div>
      </article>
    )
  }

  // Wide layout: left column only — right column is the persistent RightColumn from App
  return (
    <article>
      <div
        style={{
          width: '50%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--cs-top-padding, var(--layout-padding-top)) var(--layout-margin)',
        }}
      >
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{ position: 'relative' }}
        >
          <h1
            style={{
              fontSize: 'var(--cs-heading-size, var(--text-size-section-heading))',
              fontFamily: "'Literata', serif",
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              marginBottom: 'var(--cs-heading-spacing, 24px)',
            }}
          >
            {data.title}
          </h1>

          {textContent}

          {paperLinksContent}

          <p
            style={{
              fontSize: 'var(--text-size-caption)',
              lineHeight: 1.5,
              color: 'var(--text-grey)',
              marginTop: 24,
              fontFamily: "'Onest', sans-serif",
            }}
            dangerouslySetInnerHTML={{ __html: contactCta }}
          />
        </motion.div>
      </div>
    </article>
  )
}
