import { useState } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'
import { CaseStudyPrototype } from '@/components/CaseStudyPrototype'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { GlassModeSwitcher } from '@/components/GlassModeSwitcher'

function App() {
  const [view, setView] = useState<'main' | 'case-study'>('case-study')

  return (
    <ThemeProvider>
      <HoverProvider>
        <ViewSwitcher view={view} onViewChange={setView} />
        {view === 'main' ? <Layout /> : <CaseStudyPrototype />}
        <GlassModeSwitcher />
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
