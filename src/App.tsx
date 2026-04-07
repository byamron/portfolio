import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { CursorProvider } from '@/contexts/CursorContext'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { RightColumn } from '@/components/RightColumn'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'
import { HavanaPrivacyPolicy } from '@/components/HavanaPrivacyPolicy'
import { PlaygroundRoutes } from '@/components/PlaygroundRoutes'
import { PlaygroundDemo } from '@/components/PlaygroundDemo'
import { preloadPortraitImages, preloadPreviewImages } from '@/utils/preloadImages'
import { useIsWide } from '@/hooks/useMediaQuery'

function AppContent() {
  const { pathname } = useLocation()
  const demoRoutes = ['/slide-to-unlock', '/dvd', '/high-five']
  const isStandalone = pathname.startsWith('/havana/') || pathname.startsWith('/playground') || demoRoutes.includes(pathname)
  const isWide = useIsWide()

  useEffect(() => { preloadPortraitImages(); preloadPreviewImages() }, [])

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
        <Route path="/playground/*" element={<PlaygroundRoutes />} />
        <Route path="/slide-to-unlock" element={<PlaygroundDemo slug="slide-unlock" />} />
        <Route path="/dvd" element={<PlaygroundDemo slug="dvd-bounce" />} />
        <Route path="/high-five" element={<PlaygroundDemo slug="figma-highfive" />} />
        {/* Redirect old portfolio URLs to current routes */}
        <Route path="/eat-local-vt" element={<Navigate to="/project/eat-local-vt" replace />} />
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
          <AppContent />
        </CursorProvider>
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
