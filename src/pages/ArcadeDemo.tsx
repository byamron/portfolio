import { lazy, Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PlaygroundWrapper } from '@/components/PlaygroundWrapper'

// Manifest of allowlisted demos: portfolio-side gate that controls which
// submodule demos are reachable at /arcade/<slug>. Even if the submodule
// contains a half-finished demo, it stays hidden unless it's in this map
// AND in src/components/arcade/demos.ts.
//
// The .catch in safeLazy renders a null component if the submodule isn't
// initialized in a given worktree.
function safeLazy(loader: () => Promise<Record<string, unknown>>, exportName: string) {
  return lazy(() =>
    loader()
      .then(m => ({ default: (m[exportName] as React.ComponentType) ?? (() => null) }))
      .catch(() => ({ default: (() => null) as React.ComponentType }))
  )
}

const arcadeDemos = {
  'dvd-bounce': safeLazy(() => import('@playground/demos/dvd-bounce/DvdBounce'), 'DvdBounce'),
  'slide-unlock': safeLazy(() => import('@playground/demos/slide-unlock/SlideUnlock'), 'SlideUnlock'),
  'theme-sidebar': safeLazy(() => import('@playground/demos/theme-sidebar/ThemeSidebar'), 'ThemeSidebar'),
  'page-transition': safeLazy(() => import('@playground/demos/page-transition/PageTransition'), 'PageTransition'),
  'color-hold-pick': safeLazy(() => import('@playground/demos/color-hold-pick/ColorHoldPick'), 'ColorHoldPick'),
  'figma-highfive': safeLazy(() => import('@playground/demos/figma-highfive/FigmaHighfive'), 'FigmaHighfive'),
  'github-sparkline': safeLazy(() => import('@playground/demos/github-sparkline/GithubSparkline'), 'GithubSparkline'),
  'git-toggle': safeLazy(() => import('@playground/demos/git-toggle/GitToggle'), 'GitToggle'),
  'glass-pull': safeLazy(() => import('@playground/demos/glass-pull/GlassPull'), 'GlassPull'),
} as const

export type ArcadeDemoSlug = keyof typeof arcadeDemos

export function ArcadeDemo() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug || !(slug in arcadeDemos)) {
    return <Navigate to="/arcade" replace />
  }
  const Demo = arcadeDemos[slug as ArcadeDemoSlug]
  return (
    <PlaygroundWrapper>
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    </PlaygroundWrapper>
  )
}
