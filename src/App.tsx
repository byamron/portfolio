import { ThemeProvider } from '@/contexts/ThemeContext'
import { HoverProvider } from '@/contexts/HoverContext'
import { Layout } from '@/components/Layout'

function App() {
  return (
    <ThemeProvider>
      <HoverProvider>
        <Layout />
      </HoverProvider>
    </ThemeProvider>
  )
}

export default App
