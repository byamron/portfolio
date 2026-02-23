import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'
import { CaseStudy } from '@/components/CaseStudy'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <HoverProvider>
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/project/:slug" element={<CaseStudy />} />
          </Routes>
        </HoverProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
