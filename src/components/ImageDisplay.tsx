import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMatch } from 'react-router-dom'

const Lottie = lazy(() => import('lottie-react'))
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { transitionSettings as ts } from '@/contexts/TransitionContext'
import { projectsById, projectImageMap, defaultImageMap, linkPreviews, getProjectForSlug } from '@/data/projects'
import { caseStudiesBySlug } from '@/data/case-study-content'

// Projects whose previews need a subtle shadow to separate from the background
const needsShadow = new Set(['cip-misinfo', 'acorn-covid', 'duo-flags'])

const summaryStyle: React.CSSProperties = {
  fontFamily: "'Literata', serif",
  fontWeight: 300,
  fontSize: 'var(--text-size-summary)',
}

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fixed height for text zone — always allocated so the image area never resizes
const TEXT_ZONE_HEIGHT = 120


export function ImageDisplay() {
  const { hoveredProjectId, hoveredLinkId, navigatingProjectId } = useHover()
  const { accentColor, resolvedAppearance, cycleAccent } = useTheme()
  const csDisplayMode = 'metadata' as const

  // Detect case study route
  const caseStudyMatch = useMatch('/project/:slug')
  const caseStudySlug = caseStudyMatch?.params.slug ?? null
  const isCaseStudy = !!caseStudySlug
  const csProject = caseStudySlug ? getProjectForSlug(caseStudySlug) ?? null : null
  const caseStudy = caseStudySlug ? caseStudiesBySlug[caseStudySlug] ?? null : null

  // In case study mode: always show that project, ignore hover
  // On home page: use hover state as before
  const project = isCaseStudy
    ? csProject
    : (hoveredProjectId ? projectsById[hoveredProjectId] : null)
  const linkPreview = isCaseStudy
    ? null
    : (hoveredLinkId ? linkPreviews[hoveredLinkId] ?? null : null)

  const lottieUrl = project?.lottiePreview ?? null
  const videoUrl = linkPreview?.video ?? project?.videoPreview ?? null
  const previewDescription = isCaseStudy ? null : (project?.previewDescription ?? null)
  const hasMedia = !!videoUrl || !!lottieUrl || !!linkPreview || (project && projectImageMap[project.projectId])
  const imageSrc = linkPreview
    ? linkPreview.image ?? null
    : project
      ? (hasMedia ? (projectImageMap[project.projectId] ?? defaultImageMap[accentColor]) : (previewDescription ? null : defaultImageMap[accentColor]))
      : defaultImageMap[accentColor]
  const contentKey = previewDescription && !hasMedia
    ? `desc-${project!.id}`
    : linkPreview
      ? `link-${linkPreview.id}`
      : videoUrl
        ? `video-${project!.id}`
        : lottieUrl
          ? `lottie-${project!.id}`
          : project
            ? project.projectId
            : `default-${accentColor}`

  // Text zone: on home show summary, on case study show nothing (handled by metadata zone)
  const summary = isCaseStudy
    ? null
    : (linkPreview?.summary ?? project?.summary ?? null)
  const isPreview = !!project || !!linkPreview

  // Whether to allocate bottom padding for the text zone
  const showTextZone = !isCaseStudy || csDisplayMode === 'metadata'

  const showShadow = (project && needsShadow.has(project.id))
  const dropShadow = showShadow
    ? resolvedAppearance === 'dark'
      ? 'drop-shadow(0 2px 40px rgba(255, 255, 255, 0.1))'
      : 'drop-shadow(0 2px 40px rgba(0, 0, 0, 0.08))'
    : undefined

  const containerRef = useRef<HTMLDivElement>(null)

  const triggerSpringPress = useCallback(() => {
    if (reducedMotion || !containerRef.current) return
    const el = containerRef.current
    el.style.transition = 'none'
    el.style.transform = 'scale(0.985)'
    void el.offsetHeight
    el.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    el.style.transform = 'scale(1)'
  }, [])

  const handleClick = useCallback(() => {
    if (isCaseStudy) return // don't cycle accent on case study pages
    cycleAccent()
    triggerSpringPress()
    document.dispatchEvent(new CustomEvent('accent-cycled'))
  }, [isCaseStudy, cycleAccent, triggerSpringPress])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isCaseStudy) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      cycleAccent()
      triggerSpringPress()
      document.dispatchEvent(new CustomEvent('accent-cycled'))
    }
  }, [isCaseStudy, cycleAccent, triggerSpringPress])

  // Track whether the current image has loaded to prevent animating to a blank frame
  const [imageLoaded, setImageLoaded] = useState(false)
  const loadedSrcs = useRef(new Set<string>())

  // Reset load state when src changes, unless already cached
  useEffect(() => {
    if (imageSrc && loadedSrcs.current.has(imageSrc)) {
      setImageLoaded(true)
    } else {
      setImageLoaded(false)
    }
  }, [imageSrc])

  const handleImageLoad = useCallback(() => {
    if (imageSrc) loadedSrcs.current.add(imageSrc)
    setImageLoaded(true)
  }, [imageSrc])

  // For default portraits, consider them loaded (preloaded on mount)
  const effectiveOpacity = useMemo(() => {
    if (!isPreview) return 1 // portraits are preloaded
    return imageLoaded ? 1 : 0
  }, [isPreview, imageLoaded])

  const [lottieData, setLottieData] = useState<object | null>(null)

  useEffect(() => {
    if (!lottieUrl) {
      setLottieData(null)
      return
    }
    let cancelled = false
    fetch(lottieUrl)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setLottieData(data)
      })
      .catch(() => {
        if (!cancelled) setLottieData(null)
      })
    return () => { cancelled = true }
  }, [lottieUrl])

  const lottieLastFrame = lottieData ? (lottieData as any).op ?? 0 : 0

  // Portraits fill with cover; static link previews (resume, LinkedIn) fill like
  // portraits but use contain + background color; project previews use contain with padding.
  const isPortrait = !project && !linkPreview
  const isStaticLinkPreview = !!linkPreview && !linkPreview.video

  // Bottom padding for media area: allocate space for text zone, or none for true-center
  const mediaBottomPad = showTextZone ? `${TEXT_ZONE_HEIGHT + 24}px` : '0'

  const imgStyle: React.CSSProperties = isPortrait
    ? {
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '528 / 720',
        objectFit: 'cover',
        borderRadius: 32,
        filter: dropShadow,
      }
    : isStaticLinkPreview
      ? {
          height: '100%',
          objectFit: 'contain',
          borderRadius: 32,
          filter: dropShadow,
        }
      : {
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: 32,
          filter: dropShadow,
        }

  const imageWrapperStyle: React.CSSProperties = isPortrait || isStaticLinkPreview
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: isPortrait ? 32 : undefined,
      }
    : {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 5% ${mediaBottomPad}`,
      }

  // Metadata for case study text zone
  const metadataItems = useMemo(() => {
    if (!isCaseStudy || !csProject || !caseStudy) return null
    const items: { label: string; value: string }[] = []
    if (csProject.company) items.push({ label: 'Team', value: csProject.company })
    if (caseStudy.timeline) items.push({ label: 'Timeline', value: caseStudy.timeline })
    return items.length > 0 ? items : null
  }, [isCaseStudy, csProject, caseStudy])

  return (
    <div
      ref={containerRef}
      data-theme-image
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isCaseStudy ? -1 : 0}
      role={isCaseStudy ? undefined : 'button'}
      aria-label={isCaseStudy ? undefined : 'Cycle accent color'}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isCaseStudy ? 'default' : 'pointer',
      }}
    >
      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {linkPreview ? linkPreview.alt : project ? project.title : `Portrait, ${accentColor} theme`}
      </div>

      {/* Image */}
      <AnimatePresence mode="sync">
        {previewDescription && !hasMedia ? (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, scale: ts.previewEnterScale, filter: reducedMotion ? 'none' : `blur(${ts.previewEnterBlur}px)` }}
            animate={{ opacity: 1, scale: 1, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            exit={{ opacity: 0, scale: ts.previewExitScale, filter: reducedMotion ? 'none' : `blur(${ts.previewExitBlur}px)` }}
            transition={{ duration: reducedMotion ? 0 : ts.previewDuration, ease: ts.easing }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 32px',
            }}
          >
            {(() => {
              const nlIdx = previewDescription.indexOf('\n')
              const heading = nlIdx >= 0 ? previewDescription.slice(0, nlIdx) : previewDescription
              const body = nlIdx >= 0 ? previewDescription.slice(nlIdx + 1) : null
              return (
                <div style={{ maxWidth: 480, margin: 0 }}>
                  <p
                    style={{
                      ...summaryStyle,
                      fontSize: 'var(--text-size-summary)',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'var(--text-dark)',
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    {heading}
                  </p>
                  {body && (
                    <p
                      style={{
                        ...summaryStyle,
                        fontSize: 'var(--text-size-summary)',
                        lineHeight: 1.6,
                        color: 'var(--text-grey)',
                        textAlign: 'left',
                        marginTop: 24,
                      }}
                    >
                      {body}
                    </p>
                  )}
                </div>
              )
            })()}
          </motion.div>
        ) : videoUrl ? (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, scale: ts.previewEnterScale, filter: reducedMotion ? 'none' : `blur(${ts.previewEnterBlur}px)` }}
            animate={{ opacity: 1, scale: 1, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            exit={{ opacity: 0, scale: ts.previewExitScale, filter: reducedMotion ? 'none' : `blur(${ts.previewExitBlur}px)` }}
            transition={{ duration: reducedMotion ? 0 : ts.previewDuration, ease: ts.easing }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `0 5% ${mediaBottomPad}`,
            }}
          >
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              aria-label={linkPreview?.alt ?? project!.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: project?.id === 'sony-screenless' ? 'cover' : 'contain',
                aspectRatio: project?.id === 'sony-screenless' ? '4 / 3' : undefined,
                borderRadius: 32,
                filter: dropShadow,
              }}
            />
          </motion.div>
        ) : lottieUrl && lottieData ? (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, scale: ts.previewEnterScale, filter: reducedMotion ? 'none' : `blur(${ts.previewEnterBlur}px)` }}
            animate={{ opacity: 1, scale: 1, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            exit={{ opacity: 0, scale: ts.previewExitScale, filter: reducedMotion ? 'none' : `blur(${ts.previewExitBlur}px)` }}
            transition={{ duration: reducedMotion ? 0 : ts.previewDuration, ease: ts.easing }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: dropShadow,
              padding: `0 5% ${mediaBottomPad}`,
            }}
          >
            <Suspense fallback={null}>
              <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
                <Lottie
                  animationData={lottieData}
                  loop={false}
                  autoplay={!isCaseStudy}
                  initialSegment={isCaseStudy && lottieLastFrame > 1 ? [lottieLastFrame - 1, lottieLastFrame] : undefined}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, scale: isPortrait ? ts.portraitEnterScale : ts.previewEnterScale, filter: reducedMotion ? 'none' : `blur(${isPortrait ? ts.portraitEnterBlur : ts.previewEnterBlur}px)` }}
            animate={{ opacity: 1, scale: 1, filter: reducedMotion ? 'none' : 'blur(0px)' }}
            exit={{ opacity: 0, scale: isPortrait ? ts.portraitExitScale : ts.previewExitScale, filter: reducedMotion ? 'none' : `blur(${isPortrait ? ts.portraitExitBlur : ts.previewExitBlur}px)` }}
            transition={{ duration: reducedMotion ? 0 : (isPortrait ? ts.portraitDuration : ts.previewDuration), ease: ts.easing }}
            style={imageWrapperStyle}
          >
            <img
              src={imageSrc!}
              alt={linkPreview ? linkPreview.alt : project ? project.title : 'Ben Yamron portrait'}
              onLoad={handleImageLoad}
              style={{ ...imgStyle, opacity: effectiveOpacity, transition: 'opacity 200ms ease-in' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text zone — summary on home, metadata on case study (metadata variant only) */}
      {showTextZone && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: TEXT_ZONE_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          {/* Home page: project summary — fades out with left column on navigation */}
          <AnimatePresence mode="sync">
            {summary && (
              <motion.div
                key={contentKey + '-summary'}
                initial={{ opacity: 0, filter: reducedMotion ? 'none' : `blur(${ts.summaryEnterBlur}px)` }}
                animate={{
                  opacity: navigatingProjectId ? 0 : 1,
                  filter: reducedMotion ? 'none' : 'blur(0px)',
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={navigatingProjectId
                  ? { duration: 0.28, delay: 0.15 }
                  : { duration: reducedMotion ? 0 : ts.summaryDuration, ease: ts.easing }
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <p
                  style={{
                    ...summaryStyle,
                    lineHeight: 1.5,
                    color: 'var(--text-grey)',
                    maxWidth: 540,
                    maxHeight: TEXT_ZONE_HEIGHT,
                    overflow: 'hidden',
                    padding: '0 24px',
                    textAlign: 'left',
                    margin: '0 auto',
                  }}
                >
                  {summary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Case study: metadata — fades in with body text, fades out with left column on back */}
          {isCaseStudy && csDisplayMode === 'metadata' && metadataItems && (
            <motion.div
              key="cs-metadata"
              initial={{ opacity: 0 }}
              animate={{ opacity: navigatingProjectId ? 0 : 1 }}
              transition={navigatingProjectId
                ? { duration: 0.28 }
                : { duration: 0.35, delay: 0.15 }
              }
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5%',
              }}
            >
              {/* 50/50 grid centered under the preview image */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${metadataItems.length}, 1fr)`,
                  width: '100%',
                  maxWidth: 540,
                }}
              >
                {metadataItems.map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: "'Onest', sans-serif",
                        fontSize: 'var(--text-size-small)',
                        fontWeight: 400,
                        color: 'var(--text-light-grey)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Onest', sans-serif",
                        fontSize: 'var(--text-size-caption)',
                        fontWeight: 400,
                        color: 'var(--text-grey)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

    </div>
  )
}
