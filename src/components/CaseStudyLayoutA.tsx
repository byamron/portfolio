import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type {
  CaseStudy,
  CaseStudyVisual,
} from '@/data/case-study-content'

import { CaseStudySectionText } from './CaseStudySectionText'
import { PlaceholderVisual } from './PlaceholderVisual'

const Lottie = lazy(() => import('lottie-react'))

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface CaseStudyLayoutAProps {
  data: CaseStudy
  isNarrow: boolean
  previewImage?: string
  lottiePreview?: string
}

/** Only render visuals that have real content (prototype iframes), not empty gray boxes */
function hasRealContent(visual: CaseStudyVisual | null | undefined): visual is CaseStudyVisual {
  return !!visual?.prototypeSrc
}

export function CaseStudyLayoutA({ data, isNarrow, previewImage, lottiePreview }: CaseStudyLayoutAProps) {
  const [lottieData, setLottieData] = useState<object | null>(null)

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

  const hasHero = !!(previewImage || (lottiePreview && lottieData))
  const realGalleryItems = data.gallery.filter(item => item.prototypeSrc)

  if (isNarrow) {
    return (
      <article style={{ padding: 'var(--layout-padding-top) var(--layout-margin)' }}>
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{ marginBottom: 64 }}
        >
          <h1
            style={{
              fontSize: 'var(--text-size-title)',
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              marginBottom: 16,
            }}
          >
            {data.title}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-size-body)',
              lineHeight: 1.4,
              color: 'var(--text-medium)',
              marginBottom: 8,
            }}
          >
            {data.subtitle}
          </p>
          <p style={{ fontSize: 'var(--text-size-caption)', color: 'var(--text-grey)' }}>
            {data.timeline}
          </p>
          {hasHero && (
            <div style={{ marginTop: 32 }}>
              {lottiePreview && lottieData ? (
                <Suspense fallback={null}>
                  <Lottie
                    animationData={lottieData}
                    loop={false}
                    style={{ maxWidth: '100%', borderRadius: 32 }}
                  />
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
              ) : null}
            </div>
          )}
        </motion.header>

        {/* Body text with inline prototype visuals */}
        {data.sections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48, paddingBottom: 80 }}>
            {data.sections.map((section) => (
              <div key={section.id}>
                <CaseStudySectionText
                  heading={section.heading}
                  paragraphs={section.paragraphs}
                />
                {hasRealContent(section.visual) && (
                  <div style={{ marginTop: 32 }}>
                    <PlaceholderVisual
                      caption={section.visual.caption}
                      prototypeSrc={section.visual.prototypeSrc}
                      aspectRatio={section.visual.aspectRatio}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gallery — only items with real content */}
        {realGalleryItems.length > 0 && (
          <div
            style={{
              marginTop: 64,
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
              paddingBottom: 80,
            }}
          >
            {realGalleryItems.map((item) => (
              <PlaceholderVisual
                key={item.id}
                caption={item.caption}
                prototypeSrc={item.prototypeSrc}
                aspectRatio={item.aspectRatio}
              />
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <article style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Left column — header + body text */}
      <div
        style={{
          width: '50%',
          padding: '0 var(--layout-margin)',
        }}
      >
        {/* Header area — vertically centered in first viewport */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'left',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-size-display)',
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              marginBottom: 16,
            }}
          >
            {data.title}
          </h1>
          <p
            style={{
              fontSize: 'var(--text-size-body)',
              lineHeight: 1.4,
              color: 'var(--text-medium)',
              marginBottom: 8,
            }}
          >
            {data.subtitle}
          </p>
          <p style={{ fontSize: 'var(--text-size-caption)', color: 'var(--text-grey)' }}>
            {data.timeline}
          </p>
        </motion.header>

        {/* Body sections */}
        {data.sections.length > 0 && (
          <div
            style={{
              paddingTop: 80,
              paddingBottom: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 48,
            }}
          >
            {data.sections.map((section) => (
              <div key={section.id}>
                <CaseStudySectionText
                  heading={section.heading}
                  paragraphs={section.paragraphs}
                />
                {hasRealContent(section.visual) && (
                  <div style={{ marginTop: 32 }}>
                    <PlaceholderVisual
                      caption={section.visual.caption}
                      prototypeSrc={section.visual.prototypeSrc}
                      aspectRatio={section.visual.aspectRatio}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column — sticky hero image */}
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
          {lottiePreview && lottieData ? (
            <Suspense fallback={null}>
              <Lottie
                animationData={lottieData}
                loop={false}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: 32,
                }}
              />
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
          ) : null}
        </div>
      </div>

      {/* Gallery — only items with real content, full width below the two-column area */}
      {realGalleryItems.length > 0 && (
        <div
          style={{
            width: '100%',
            padding: '80px var(--layout-margin) 80px',
            display: 'grid',
            gridTemplateColumns: realGalleryItems.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 40,
          }}
        >
          {(() => {
            const elements: React.ReactNode[] = []
            let i = 0
            while (i < realGalleryItems.length) {
              const item = realGalleryItems[i]
              if (item.size === 'full') {
                elements.push(
                  <PlaceholderVisual key={item.id} caption={item.caption} prototypeSrc={item.prototypeSrc} aspectRatio={item.aspectRatio} />,
                )
                i++
              } else {
                const next = realGalleryItems[i + 1]
                if (next && next.size === 'half') {
                  elements.push(
                    <div
                      key={item.id}
                      style={{ display: 'flex', gap: 40 }}
                    >
                      <div style={{ flex: 1 }}>
                        <PlaceholderVisual caption={item.caption} prototypeSrc={item.prototypeSrc} aspectRatio={item.aspectRatio} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <PlaceholderVisual caption={next.caption} prototypeSrc={next.prototypeSrc} aspectRatio={next.aspectRatio} />
                      </div>
                    </div>,
                  )
                  i += 2
                } else {
                  elements.push(
                    <PlaceholderVisual key={item.id} caption={item.caption} prototypeSrc={item.prototypeSrc} aspectRatio={item.aspectRatio} />,
                  )
                  i++
                }
              }
            }
            return elements
          })()}
        </div>
      )}
    </article>
  )
}
