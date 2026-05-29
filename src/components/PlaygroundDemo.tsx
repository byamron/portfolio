import { lazy, Suspense } from 'react'
import { PlaygroundWrapper } from './PlaygroundWrapper'

function safeLazy(loader: () => Promise<Record<string, unknown>>, exportName: string) {
  return lazy(() =>
    loader()
      .then(m => ({ default: (m[exportName] as React.ComponentType) ?? (() => null) }))
      .catch(() => ({ default: (() => null) as React.ComponentType }))
  )
}

const demos = {
'slide-unlock': safeLazy(() => import('@playground/demos/slide-unlock/SlideUnlock'), 'SlideUnlock'),
'dvd-bounce': safeLazy(() => import('@playground/demos/dvd-bounce/DvdBounce'), 'DvdBounce'),
'figma-highfive': safeLazy(() => import('@playground/demos/figma-highfive/FigmaHighfive'), 'FigmaHighfive'),
} as const

export function PlaygroundDemo({ slug }: { slug: keyof typeof demos }) {
  const Demo = demos[slug]
  return (
    <PlaygroundWrapper>
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    </PlaygroundWrapper>
  )
}
