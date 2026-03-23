import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { CursorProvider } from '@/contexts/CursorContext'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'
import { preloadPortraitImages } from '@/utils/preloadImages'

function App() {
  useEffect(() => { preloadPortraitImages() }, [])

  return (
    <ThemeProvider>
      <HoverProvider>
        <CursorProvider>
          <CustomCursor />
          <CursorCompanion />
          <SidebarThemeControls />
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/project/:slug" element={<CaseStudyPage />} />
          </Routes>
        </CursorProvider>
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
