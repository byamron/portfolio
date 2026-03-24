import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { CaseStudy } from '@/data/case-study-content'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'

const Lottie = lazy(() => import('lottie-react'))

const DEFAULT_CONTACT_CTA =
  'Want the details? <a href="mailto:ben.yamron@icloud.com" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">Get in touch</a>.'

interface CaseStudyLayoutAProps {
  data: CaseStudy
  isNarrow: boolean
  previewImage?: string
  lottiePreview?: string
  videoPreview?: string
}

export function CaseStudyLayoutA({ data, isNarrow, previewImage, lottiePreview, videoPreview }: CaseStudyLayoutAProps) {
  const [lottieData, setLottieData] = useState<object | null>(null)
  const narrativeRef = useRef<HTMLDivElement>(null)

  // Glass highlight for paper link cards and contact CTA within the narrative
  useGlassHighlight(narrativeRef, {
    borderRadius: 16,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-link-card], [data-contact-card]',
  })

  useEffect(() => {
    if (!lottiePreview) {
      setLottieData(null)
      return
    }
    let cancelled = false
    fetch(lottiePreview)
      .then(r => r.json())
      .then(d => { if (!cancelled) setLottieData(d) })
      .catch(() => { if (!cancelled) setLottieData(null) })
    return () => { cancelled = true }
  }, [lottiePreview])

  const lottieLastFrame = lottieData ? (lottieData as any).op ?? 0 : 0
  const hasMedia = !!(videoPreview || previewImage || (lottiePreview && lottieData))

  const narrative = data.narrative
  const paperLinks = data.paperLinks
  const contactCta = data.contactCta ?? DEFAULT_CONTACT_CTA

  // Shared media element — video > lottie > image
  const isSony = data.id === 'sony-screenless-tv'

  const mediaElement = videoPreview ? (
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
        objectFit: isSony ? 'cover' : 'contain',
        aspectRatio: isSony ? '4 / 3' : undefined,
        borderRadius: 32,
        viewTransitionName: 'project-hero',
      }}
    />
  ) : lottiePreview && lottieData ? (
    <Suspense fallback={null}>
      <div style={{ maxWidth: '100%', maxHeight: '100%', viewTransitionName: 'project-hero' }}>
        <Lottie
          animationData={lottieData}
          autoplay={false}
          loop={false}
          initialSegment={lottieLastFrame > 1 ? [lottieLastFrame - 1, lottieLastFrame] : undefined}
          style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 32 }}
        />
      </div>
    </Suspense>
  ) : previewImage ? (
    <img
      src={previewImage}
      alt={data.title}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: 32,
        viewTransitionName: 'project-hero',
      }}
    />
  ) : null

  // Text content — narrative paragraphs or subtitle fallback
  const narrativeStyle = {
    fontFamily: "'Literata', serif",
    fontSize: 'var(--text-size-narrative)',
    fontWeight: 300 as const,
    lineHeight: 1.4,
    color: 'var(--text-grey)',
  }

  const textContent = narrative ? (
    narrative.map((html, i) => (
      <p
        key={i}
        style={{
          ...narrativeStyle,
          marginBottom: i < narrative.length - 1 ? 16 : 0,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ))
  ) : (
    <p style={narrativeStyle}>
      {data.subtitle}
    </p>
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
      <article style={{ padding: 'calc(var(--layout-padding-top) + 32px) var(--layout-margin) var(--layout-padding-top)' }}>
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{ position: 'relative' }}
        >
          <h1
            style={{
              fontSize: 'var(--text-size-section-heading)',
              fontFamily: "'Literata', serif",
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              marginBottom: 24,
            }}
          >
            {data.title}
          </h1>

          {textContent}

          {paperLinksContent}

          {hasMedia && (
            <div style={{ marginTop: 32 }}>
              {mediaElement}
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

  return (
    <article>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* Left column — title + narrative + contact */}
        <div
          style={{
            width: '50%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--layout-padding-top) var(--layout-margin)',
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
                fontSize: 'var(--text-size-section-heading)',
                fontFamily: "'Literata', serif",
                fontWeight: 300,
                lineHeight: 1.2,
                color: 'var(--text-dark)',
                marginBottom: 24,
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

        {/* Right column — sticky media */}
        <div style={{ width: '50%' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--layout-padding-top) var(--layout-margin)',
            }}
          >
            {mediaElement}
          </div>
        </div>
      </div>
    </article>
  )
}
