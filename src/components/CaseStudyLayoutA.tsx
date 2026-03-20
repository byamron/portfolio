import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type {
  CaseStudy,
  CaseStudyVisual,
} from '@/data/case-study-content'

import { CaseStudySectionText } from './CaseStudySectionText'
import { PlaceholderVisual } from './PlaceholderVisual'

interface CaseStudyLayoutAProps {
  data: CaseStudy
  isNarrow: boolean
  previewImage?: string
}

/**
 * Collect all visuals for the evidence grid: section visuals + gallery items.
 * heroVisual is excluded — it's already shown in the hero zone.
 */
function collectVisuals(data: CaseStudy): CaseStudyVisual[] {
  const visuals: CaseStudyVisual[] = []
  for (const section of data.sections) {
    if (section.visual) visuals.push(section.visual)
  }
  for (const item of data.gallery) {
    visuals.push({ id: item.id, caption: item.caption ?? '' })
  }
  return visuals
}

export function CaseStudyLayoutA({ data, isNarrow, previewImage }: CaseStudyLayoutAProps) {
  const allVisuals = useMemo(() => collectVisuals(data), [data])
  const visuals = data.sections.map((s) => s.visual).filter(Boolean) as CaseStudyVisual[]
  const hasGallery = data.gallery.length > 0

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
          {(previewImage || data.heroVisual) && (
            <div style={{ marginTop: 32 }}>
              {previewImage ? (
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
              ) : (
                <PlaceholderVisual
                  caption={data.heroVisual!.caption}
                  prototypeSrc={data.heroVisual!.prototypeSrc}
                  aspectRatio={data.heroVisual!.aspectRatio}
                />
              )}
            </div>
          )}
        </motion.header>

        {/* Body text with inline visuals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {data.sections.map((section) => (
            <div key={section.id}>
              <CaseStudySectionText
                heading={section.heading}
                paragraphs={section.paragraphs}
              />
              {section.visual && (
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

        {/* Gallery — single column on narrow */}
        {hasGallery && (
          <div
            style={{
              marginTop: 64,
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
            }}
          >
            {data.gallery.map((item) => (
              <PlaceholderVisual key={item.id} caption={item.caption} prototypeSrc={item.prototypeSrc} aspectRatio={item.aspectRatio} />
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <article>
      {/* Zone 1: Hero — 100vh two-column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '50%',
            height: '100vh',
            padding: 'var(--layout-padding-top) var(--layout-margin)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            style={{ textAlign: 'left' }}
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
        </div>

        <div
          style={{
            width: '50%',
            height: '100vh',
            padding: 'var(--layout-padding-top) var(--layout-margin)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {previewImage ? (
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
          ) : data.heroVisual ? (
            <PlaceholderVisual
              caption={data.heroVisual.caption}
              prototypeSrc={data.heroVisual.prototypeSrc}
              aspectRatio={data.heroVisual.aspectRatio}
            />
          ) : null}
        </div>
      </div>

      {/* Zone 2: Body text — two-column with sticky visuals */}
      {data.sections.length > 0 && (
        <div>
          {data.sections.map((section, i) => (
            <div
              key={section.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div
                style={{
                  width: '50%',
                  padding: i === 0
                    ? '80px var(--layout-margin) 0'
                    : '0 var(--layout-margin) 0',
                  marginBottom: i < data.sections.length - 1 ? 48 : 0,
                }}
              >
                <CaseStudySectionText
                  heading={section.heading}
                  paragraphs={section.paragraphs}
                />
              </div>

              <div
                style={{
                  width: '50%',
                  padding: '20px var(--layout-margin) 40px 0',
                }}
              >
                {visuals[i] && (
                  <div style={{ position: 'sticky', top: 64 }}>
                    <PlaceholderVisual
                      caption={visuals[i]!.caption}
                      prototypeSrc={visuals[i]!.prototypeSrc}
                      aspectRatio={visuals[i]!.aspectRatio}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery: full-width visual showcase after the narrative */}
      {hasGallery && (
        <div
          style={{
            padding: '80px var(--layout-margin) 80px',
            display: 'grid',
            gridTemplateColumns: allVisuals.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 40,
          }}
        >
          {/* Render gallery items — full items span the width,
              half items pair up in a 2-up grid */}
          {(() => {
            const elements: React.ReactNode[] = []
            let i = 0
            while (i < data.gallery.length) {
              const item = data.gallery[i]
              if (item.size === 'full') {
                elements.push(
                  <PlaceholderVisual key={item.id} caption={item.caption} prototypeSrc={item.prototypeSrc} aspectRatio={item.aspectRatio} />,
                )
                i++
              } else {
                // Pair consecutive half items
                const next = data.gallery[i + 1]
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
                    <PlaceholderVisual
                      key={item.id}
                      caption={item.caption}
                      prototypeSrc={item.prototypeSrc}
                      aspectRatio={item.aspectRatio}
                    />,
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
