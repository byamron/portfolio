import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { CursorProvider } from '@/contexts/CursorContext'
import { TypographyProvider } from '@/contexts/TypographyContext'

import { HavanaPrivacyPolicy } from '@/components/HavanaPrivacyPolicy'
import { TrioPrivacyPolicy } from '@/components/TrioPrivacyPolicy'
import { SimpleSite } from '@/proto/SimpleSite'

// The site is one page. The previous portfolio (case studies, playground,
// demos) is kept at the `portfolio-v1` tag; its old URLs land on the home page.
function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<SimpleSite />} />
      {/* The Havana and Trio apps' privacy policies stay at their URLs. */}
      <Route path="/havana/privacy" element={<HavanaPrivacyPolicy />} />
      <Route path="/trio/privacy" element={<TrioPrivacyPolicy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
