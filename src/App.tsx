import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { CursorProvider } from '@/contexts/CursorContext'
import { TypographyProvider } from '@/contexts/TypographyContext'

import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { RightColumn } from '@/components/RightColumn'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'
import { HavanaPrivacyPolicy } from '@/components/HavanaPrivacyPolicy'
const PlaygroundDemo = lazy(() => import('@/components/PlaygroundDemo').then(m => ({ default: m.PlaygroundDemo })))
const Arcade = lazy(() => import('@/pages/Arcade').then(m => ({ default: m.Arcade })))
const ArcadeDemo = lazy(() => import('@/pages/ArcadeDemo').then(m => ({ default: m.ArcadeDemo })))
import { preloadPortraitImages, preloadPreviewImages } from '@/utils/preloadImages'
import { useIsWide } from '@/hooks/useMediaQuery'

function AppContent() {
  const { pathname } = useLocation()
  const demoRoutes = ['/slide-to-unlock', '/high-five']
  const isStandalone = pathname.startsWith('/havana/') || pathname === '/arcade' || pathname.startsWith('/arcade/') || demoRoutes.includes(pathname)
  const isWide = useIsWide()

  useEffect(() => { if (isStandalone) return; preloadPortraitImages(); preloadPreviewImages() }, [isStandalone])

  return (
    <>
      {!isStandalone && (
        <>
          <CustomCursor />
          <CursorCompanion />
          <SidebarThemeControls />
        </>
      )}
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/project/:slug" element={<CaseStudyPage />} />
        <Route path="/havana/privacy" element={<HavanaPrivacyPolicy />} />
        <Route path="/arcade" element={<Suspense fallback={null}><Arcade /></Suspense>} />
        <Route path="/arcade/:slug" element={<Suspense fallback={null}><ArcadeDemo /></Suspense>} />
        <Route path="/slide-to-unlock" element={<Suspense fallback={null}><PlaygroundDemo slug="slide-unlock" /></Suspense>} />
        <Route path="/dvd" element={<Navigate to="/arcade/dvd-bounce" replace />} />
        <Route path="/high-five" element={<Suspense fallback={null}><PlaygroundDemo slug="figma-highfive" /></Suspense>} />
        {/* Redirect old portfolio URLs to current routes */}
        <Route path="/eat-local-vt" element={<Navigate to="/project/eat-local-vt" replace />} />
        <Route path="/project/forge" element={<Navigate to="/project/optimizing-my-workflow" replace />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/rivet" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Persistent right column — never unmounts during route transitions */}
      {isWide && !isStandalone && <RightColumn />}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <CursorProvider>
          <TypographyProvider>
            <AppContent />
          </TypographyProvider>
        </CursorProvider>
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
