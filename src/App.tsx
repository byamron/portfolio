import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/project/:slug" element={<CaseStudyPage />} />
        </Routes>
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
