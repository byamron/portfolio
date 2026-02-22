import { ModeSwitcher } from './ModeSwitcher'
import { AccentPicker } from './AccentPicker'

export function ThemeControls() {
  return (
    <footer
      style={{
        display: 'flex',
        gap: 64,
        padding: '0 16px',
        alignItems: 'center',
      }}
    >
      <ModeSwitcher />
      <AccentPicker />
    </footer>
  )
}
