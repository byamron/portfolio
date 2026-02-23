import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'
import { CaseStudyPage } from '@/components/CaseStudyPage'
import { GlassModeSwitcher } from '@/components/GlassModeSwitcher'
import { FontPanel } from '@/components/FontPanel'

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/project/:slug" element={<CaseStudyPage />} />
        </Routes>
        <GlassModeSwitcher />
        {import.meta.env.DEV && <FontPanel />}
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
