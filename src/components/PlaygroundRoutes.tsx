import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PlaygroundWrapper } from './PlaygroundWrapper'
import { PlaygroundGallery } from './PlaygroundGallery'

// Lazy-load each demo — only include demos whose source files exist.
// Demos in @playground/demos/* are excluded when ui-playground/src is empty.
const demoModules = import.meta.glob('@playground/demos/*/index.{ts,tsx}')

// Only register routes for demos that actually exist on disk
const hasDemo = (name: string) =>
  Object.keys(demoModules).some(k => k.includes(`/${name}/`))

// Safe lazy loader: returns null component if the demo doesn't exist
function safeLazy(path: string, name: string, exportName: string) {
  if (!hasDemo(name)) return null
  return lazy(() =>
    import(/* @vite-ignore */ path).then(m => { const Component = (m as Record<string, React.ComponentType>)[exportName]; return { default: Component ?? (() => null) } })
  )
}

const WaterRipple = safeLazy('@playground/demos/water-ripple/WaterRipple', 'water-ripple', 'WaterRipple')
const GlassPull = safeLazy('@playground/demos/glass-pull/GlassPull', 'glass-pull', 'GlassPull')
const MagneticButton = safeLazy('@playground/demos/magnetic-button/MagneticButton', 'magnetic-button', 'MagneticButton')
const TextScramble = safeLazy('@playground/demos/text-scramble/TextScramble', 'text-scramble', 'TextScramble')
const ElasticToggle = safeLazy('@playground/demos/elastic-toggle/ElasticToggle', 'elastic-toggle', 'ElasticToggle')
const FisheyeText = safeLazy('@playground/demos/fisheye-text/FisheyeText', 'fisheye-text', 'FisheyeText')
const FigpalCursor = safeLazy('@playground/demos/figpal-cursor/FigpalCursor', 'figpal-cursor', 'FigpalCursor')
const CursorMorph = safeLazy('@playground/demos/cursor-morph/CursorMorph', 'cursor-morph', 'CursorMorph')
const ThemeSidebar = safeLazy('@playground/demos/theme-sidebar/ThemeSidebar', 'theme-sidebar', 'ThemeSidebar')
const TaskRanking = safeLazy('@playground/demos/task-ranking/TaskRanking', 'task-ranking', 'TaskRanking')
const DvdBounce = safeLazy('@playground/demos/dvd-bounce/DvdBounce', 'dvd-bounce', 'DvdBounce')
const SlideUnlock = safeLazy('@playground/demos/slide-unlock/SlideUnlock', 'slide-unlock', 'SlideUnlock')
const FigmaHighfive = safeLazy('@playground/demos/figma-highfive/FigmaHighfive', 'figma-highfive', 'FigmaHighfive')
const FrameGuide = safeLazy('@playground/demos/frame-guide/FrameGuide', 'frame-guide', 'FrameGuide')

function DemoPage({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundWrapper>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </PlaygroundWrapper>
  )
}

// Helper: only render a route if the component exists
function DemoRoute({ path, Component }: { path: string; Component: React.LazyExoticComponent<React.ComponentType> | null }) {
  if (!Component) return null
  return <Route path={path} element={<DemoPage><Component /></DemoPage>} />
}

export function PlaygroundRoutes() {
  return (
    <Routes>
      <Route index element={<PlaygroundWrapper><PlaygroundGallery /></PlaygroundWrapper>} />
      <DemoRoute path="water-ripple" Component={WaterRipple} />
      <DemoRoute path="glass-pull" Component={GlassPull} />
      <DemoRoute path="magnetic-button" Component={MagneticButton} />
      <DemoRoute path="text-scramble" Component={TextScramble} />
      <DemoRoute path="elastic-toggle" Component={ElasticToggle} />
      <DemoRoute path="fisheye-text" Component={FisheyeText} />
      <DemoRoute path="figpal-cursor" Component={FigpalCursor} />
      <DemoRoute path="cursor-morph" Component={CursorMorph} />
      <DemoRoute path="theme-sidebar" Component={ThemeSidebar} />
      <DemoRoute path="task-ranking" Component={TaskRanking} />
      <DemoRoute path="dvd-bounce" Component={DvdBounce} />
      <DemoRoute path="slide-unlock" Component={SlideUnlock} />
      <DemoRoute path="figma-highfive" Component={FigmaHighfive} />
      <DemoRoute path="frame-guide" Component={FrameGuide} />
    </Routes>
  )
}
