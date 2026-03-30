import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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
import { preloadPortraitImages, preloadPreviewImages } from '@/utils/preloadImages'
import { useIsWide } from '@/hooks/useMediaQuery'

function AppContent() {
  const { pathname } = useLocation()
  const isStandalone = pathname.startsWith('/havana/')
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
