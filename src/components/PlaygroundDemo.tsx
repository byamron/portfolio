import { lazy, Suspense } from 'react'
import { PlaygroundWrapper } from './PlaygroundWrapper'

const demos = {
  'slide-unlock': lazy(() => import('@playground/demos/slide-unlock/SlideUnlock').then(m => ({ default: m.SlideUnlock }))),
  'dvd-bounce': lazy(() => import('@playground/demos/dvd-bounce/DvdBounce').then(m => ({ default: m.DvdBounce }))),
  'figma-highfive': lazy(() => import('@playground/demos/figma-highfive/FigmaHighfive').then(m => ({ default: m.FigmaHighfive }))),
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
