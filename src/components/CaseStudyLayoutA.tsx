import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { CaseStudy } from '@/data/case-study-content'

import { CaseStudySectionText } from './CaseStudySectionText'

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

        {/* Body text — flowing sections */}
        {data.sections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48, paddingBottom: 80 }}>
            {data.sections.map((section) => (
              <CaseStudySectionText
                key={section.id}
                heading={section.heading}
                paragraphs={section.paragraphs}
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
              <CaseStudySectionText
                key={section.id}
                heading={section.heading}
                paragraphs={section.paragraphs}
              />
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
    </article>
  )
}
