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
              fontSize: 36,
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
              fontSize: 18,
              lineHeight: 1.4,
              color: 'var(--text-medium)',
              marginBottom: 8,
            }}
          >
            {data.subtitle}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-grey)' }}>
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
                <PlaceholderVisual caption={data.heroVisual!.caption} />
              )}
            </div>
          )}
        </motion.header>

        {/* Body text — flowing sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {data.sections.map((section) => (
            <CaseStudySectionText
              key={section.id}
              heading={section.heading}
              paragraphs={section.paragraphs}
            />
          ))}
        </div>

        {/* Visual evidence — single column on narrow */}
        {allVisuals.length > 0 && (
          <div
            style={{
              marginTop: 64,
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
            }}
          >
            {allVisuals.map((visual) => (
              <PlaceholderVisual key={visual.id} caption={visual.caption} />
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
                fontSize: 48,
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
                fontSize: 18,
                lineHeight: 1.4,
                color: 'var(--text-medium)',
                marginBottom: 8,
              }}
            >
              {data.subtitle}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-grey)' }}>
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
            <PlaceholderVisual caption={data.heroVisual.caption} />
          ) : null}
        </div>
      </div>

      {/* Zone 2: Body text — left-aligned in hero's left column, right column empty */}
      {data.sections.length > 0 && (
        <div
          style={{
            width: '50%',
            padding: '80px var(--layout-margin) 0',
          }}
        >
          {data.sections.map((section, i) => (
            <div
              key={section.id}
              style={{
                marginBottom: i < data.sections.length - 1 ? 48 : 0,
              }}
            >
              <CaseStudySectionText
                heading={section.heading}
                paragraphs={section.paragraphs}
              />
            </div>
          ))}
        </div>
      )}

      {/* Zone 3: Visual evidence grid — full page width matching hero */}
      {allVisuals.length > 0 && (
        <div
          style={{
            padding: '80px var(--layout-margin) 80px',
            display: 'grid',
            gridTemplateColumns: allVisuals.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 40,
          }}
        >
          {allVisuals.map((visual, i) => (
            <div
              key={visual.id}
              style={
                allVisuals.length > 1 && allVisuals.length % 2 !== 0 && i === allVisuals.length - 1
                  ? { gridColumn: 'span 2' }
                  : undefined
              }
            >
              <PlaceholderVisual caption={visual.caption} />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
