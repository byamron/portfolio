import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      Framer does not honour prefers-reduced-motion on its own. Without this the
      CSS animations were gated but every layout and slide animation still ran
      at full motion. `user` keeps opacity and drops transform and layout, which
      is the right split here.
    */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
