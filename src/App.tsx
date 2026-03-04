import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { CursorProvider } from '@/contexts/CursorContext'
import { CustomCursor } from '@/components/CustomCursor'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <CursorProvider>
          <CustomCursor />
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
