import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PlaygroundWrapper } from './PlaygroundWrapper'
import { PlaygroundGallery } from './PlaygroundGallery'

// Lazy-load each demo to keep the main bundle small
const WaterRipple = lazy(() => import('@playground/demos/water-ripple/WaterRipple').then(m => ({ default: m.WaterRipple })))
const GlassPull = lazy(() => import('@playground/demos/glass-pull/GlassPull').then(m => ({ default: m.GlassPull })))
const MagneticButton = lazy(() => import('@playground/demos/magnetic-button/MagneticButton').then(m => ({ default: m.MagneticButton })))
const TextScramble = lazy(() => import('@playground/demos/text-scramble/TextScramble').then(m => ({ default: m.TextScramble })))
const ElasticToggle = lazy(() => import('@playground/demos/elastic-toggle/ElasticToggle').then(m => ({ default: m.ElasticToggle })))
const FisheyeText = lazy(() => import('@playground/demos/fisheye-text/FisheyeText').then(m => ({ default: m.FisheyeText })))
const FigpalCursor = lazy(() => import('@playground/demos/figpal-cursor/FigpalCursor').then(m => ({ default: m.FigpalCursor })))
const CursorMorph = lazy(() => import('@playground/demos/cursor-morph/CursorMorph').then(m => ({ default: m.CursorMorph })))
const ThemeSidebar = lazy(() => import('@playground/demos/theme-sidebar/ThemeSidebar').then(m => ({ default: m.ThemeSidebar })))
const TaskRanking = lazy(() => import('@playground/demos/task-ranking/TaskRanking').then(m => ({ default: m.TaskRanking })))
const DvdBounce = lazy(() => import('@playground/demos/dvd-bounce/DvdBounce').then(m => ({ default: m.DvdBounce })))
const SlideUnlock = lazy(() => import('@playground/demos/slide-unlock/SlideUnlock').then(m => ({ default: m.SlideUnlock })))
const FigmaHighfive = lazy(() => import('@playground/demos/figma-highfive/FigmaHighfive').then(m => ({ default: m.FigmaHighfive })))
const FrameGuide = lazy(() => import('@playground/demos/frame-guide/FrameGuide').then(m => ({ default: m.FrameGuide })))

function DemoPage({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundWrapper>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </PlaygroundWrapper>
  )
}

export function PlaygroundRoutes() {
  return (
    <Routes>
      <Route index element={<PlaygroundWrapper><PlaygroundGallery /></PlaygroundWrapper>} />
      <Route path="water-ripple" element={<DemoPage><WaterRipple /></DemoPage>} />
      <Route path="glass-pull" element={<DemoPage><GlassPull /></DemoPage>} />
      <Route path="magnetic-button" element={<DemoPage><MagneticButton /></DemoPage>} />
      <Route path="text-scramble" element={<DemoPage><TextScramble /></DemoPage>} />
      <Route path="elastic-toggle" element={<DemoPage><ElasticToggle /></DemoPage>} />
      <Route path="fisheye-text" element={<DemoPage><FisheyeText /></DemoPage>} />
      <Route path="figpal-cursor" element={<DemoPage><FigpalCursor /></DemoPage>} />
      <Route path="cursor-morph" element={<DemoPage><CursorMorph /></DemoPage>} />
      <Route path="theme-sidebar" element={<DemoPage><ThemeSidebar /></DemoPage>} />
      <Route path="task-ranking" element={<DemoPage><TaskRanking /></DemoPage>} />
      <Route path="dvd-bounce" element={<DemoPage><DvdBounce /></DemoPage>} />
      <Route path="slide-unlock" element={<DemoPage><SlideUnlock /></DemoPage>} />
      <Route path="figma-highfive" element={<DemoPage><FigmaHighfive /></DemoPage>} />
      <Route path="frame-guide" element={<DemoPage><FrameGuide /></DemoPage>} />
    </Routes>
  )
}
