import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'
import { GlassModeSwitcher } from '@/components/GlassModeSwitcher'

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <Layout />
        <GlassModeSwitcher />
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
