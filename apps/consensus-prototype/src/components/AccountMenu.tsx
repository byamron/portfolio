import { useLayoutEffect, useRef, useState } from 'react'
import { useAppState, type Theme } from '../state/AppState'
import { Icon, type IconName } from './icons'
import { useStub } from './StubHint'

const THEME_LABEL: Record<Theme, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

const THEME_ICON: Record<Theme, IconName> = {
  system: 'sun',
  light: 'sun',
  dark: 'moon',
}

/** Cycles the way the product's does: one click, one step. */
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }

/**
 * The account menu at the foot of the rail. Mostly out of scope — Settings,
 * Pricing, Help and Sign out say what they would do — but the theme control is
 * real, because it is the only setting this prototype actually has.
 */
export function AccountMenu() {
  const { theme, setTheme } = useAppState()
  const stub = useStub()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, bottom: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPosition({ left: rect.left, bottom: window.innerHeight - rect.top + 6 })
    }
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-[12.96px]
          leading-[20px] text-muted hover:bg-fill ${open ? 'bg-fill' : ''}`}
      >
        <span className="size-5 shrink-0 rounded-full bg-line" />
        <span className="min-w-0 grow truncate text-left">ben.yamron@icloud.com</span>
        <Icon name="chevronUpDown" size={14} className="shrink-0 text-faint" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Account"
            style={{ left: position.left, bottom: position.bottom }}
            className="fixed z-50 w-[300px] overflow-hidden rounded-[14px] border border-line
              bg-panel shadow-[0_16px_40px_-12px_rgba(0,0,0,0.24)]"
          >
            <header className="flex items-center gap-3 px-3 py-3">
              <span className="size-9 shrink-0 rounded-full bg-line" />
              <span className="min-w-0 grow">
                <span className="block truncate text-[14px] font-medium leading-5 text-ink">
                  ben.yamron@icloud.com
                </span>
                <span className="block truncate text-[12.96px] leading-[20px] text-muted">
                  ben.yamron@icloud.com
                </span>
              </span>
              <span className="label shrink-0 rounded-full bg-fill px-2 py-1 text-muted">Free</span>
            </header>

            <div className="border-t border-hairline py-1">
              <Row icon="sliders" label="Settings" onClick={(e) => stub(e, 'Open account settings')} />
              <Row icon="pricing" label="Pricing" onClick={(e) => stub(e, 'Compare plans')} />
              <Row icon="help" label="Help" trailing={<Icon name="chevronRight" size={15} />} onClick={(e) => stub(e, 'Open the help centre')} />
            </div>

            <div className="border-t border-hairline py-1">
              <Row
                icon={THEME_ICON[theme]}
                label="Toggle theme"
                trailing={<span className="label text-muted">{THEME_LABEL[theme]}</span>}
                onClick={() => setTheme(NEXT[theme])}
              />
              <Row
                icon="ghost"
                label="Incognito mode"
                trailing={
                  <span className="flex h-5 w-9 shrink-0 items-center rounded-full bg-line px-0.5">
                    <span className="size-4 rounded-full bg-panel" />
                  </span>
                }
                onClick={(e) => stub(e, 'Browse without saving to History')}
              />
            </div>

            <div className="border-t border-hairline py-1">
              <Row
                icon="signOut"
                label="Sign out"
                danger
                onClick={(e) => stub(e, 'Sign out of Consensus')}
              />
            </div>

            <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline px-3 py-2.5">
              {['About', 'Add to Claude', 'Add to ChatGPT'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={(e) => stub(e, `Open ${label}`)}
                  className="text-[12.96px] leading-[20px] text-muted underline underline-offset-2 hover:text-ink"
                >
                  {label}
                </button>
              ))}
            </footer>
          </div>
        </>
      )}
    </>
  )
}

function Row({
  icon,
  label,
  trailing,
  danger,
  onClick,
}: {
  icon: IconName
  label: string
  trailing?: React.ReactNode
  danger?: boolean
  onClick: (event: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] font-medium
        leading-5 hover:bg-rail ${danger ? 'text-red' : 'text-ink'}`}
    >
      <Icon name={icon} size={17} className={danger ? '' : 'text-muted'} strokeWidth={1.6} />
      <span className="grow">{label}</span>
      {trailing}
    </button>
  )
}
