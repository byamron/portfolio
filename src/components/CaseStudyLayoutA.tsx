import { useMemo } from 'react'
import type {
  CaseStudy,
  CaseStudySection,
  CaseStudyVisual,
} from '@/data/case-study-content'

import { CaseStudySectionText } from './CaseStudySectionText'
import { PlaceholderVisual } from './PlaceholderVisual'

interface CaseStudyLayoutAProps {
  data: CaseStudy
  isNarrow: boolean
}

/**
 * Resolve which visual to show for each section. If a section has its own
 * visual, use that. Otherwise, carry forward the most recent visual.
 */
function resolveVisuals(
  sections: CaseStudySection[],
  heroVisual?: CaseStudyVisual,
): (CaseStudyVisual | null)[] {
  let last: CaseStudyVisual | null = heroVisual ?? null
  return sections.map((section) => {
    if (section.visual) last = section.visual
    return last
  })
}

export function CaseStudyLayoutA({ data, isNarrow }: CaseStudyLayoutAProps) {
  const visuals = useMemo(
    () => resolveVisuals(data.sections, data.heroVisual),
    [data.sections, data.heroVisual],
  )

  const hasGallery = data.gallery.length > 0

  if (isNarrow) {
    return (
      <article style={{ padding: 'var(--layout-padding-top) var(--layout-margin)' }}>
        <header style={{ marginBottom: 64 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 400,
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
          {data.heroVisual && (
            <div style={{ marginTop: 32 }}>
              <PlaceholderVisual caption={data.heroVisual.caption} />
            </div>
          )}
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {data.sections.map((section) => (
            <div key={section.id}>
              <CaseStudySectionText
                heading={section.heading}
                paragraphs={section.paragraphs}
              />
              {section.visual && (
                <div style={{ marginTop: 32 }}>
                  <PlaceholderVisual caption={section.visual.caption} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gallery — single column on narrow */}
        {hasGallery && (
          <div
            style={{
              marginTop: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
            }}
          >
            {data.gallery.map((item) => (
              <PlaceholderVisual key={item.id} caption={item.caption} />
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <article>
      {/* Hero: 100vh two-column row with vertically centered text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--layout-gap)',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '50%',
            padding: 'var(--layout-padding-top) var(--layout-margin) 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <header>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 400,
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
          </header>
        </div>

        <div
          style={{
            width: '50%',
            padding: 'var(--layout-padding-top) var(--layout-margin) 40px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {data.heroVisual && (
            <PlaceholderVisual caption={data.heroVisual.caption} />
          )}
        </div>
      </div>

      {/* Narrative: one section per row, visuals carry forward */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {data.sections.map((section, i) => (
          <div
            key={section.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 'var(--layout-gap)',
              minHeight: '100vh',
            }}
          >
            <div
              style={{
                width: '50%',
                padding: '20px var(--layout-margin) 40px',
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
                  <PlaceholderVisual caption={visuals[i]!.caption} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gallery: full-width visual showcase after the narrative */}
      {hasGallery && (
        <div
          style={{
            marginTop: 80,
            padding: '0 var(--layout-margin) 64px',
            display: 'flex',
            flexDirection: 'column',
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
                  <PlaceholderVisual key={item.id} caption={item.caption} />,
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
                        <PlaceholderVisual caption={item.caption} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <PlaceholderVisual caption={next.caption} />
                      </div>
                    </div>,
                  )
                  i += 2
                } else {
                  elements.push(
                    <PlaceholderVisual
                      key={item.id}
                      caption={item.caption}
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
