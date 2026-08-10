import { useState, type FormEvent, type ReactNode } from 'react'
import { Icon, Logo } from './icons'

// Client-side only — this is a public static build, so this keeps casual visitors
// and search engines out, not a real access control. Don't put anything sensitive here.
const PASSWORD = 'consensus'
const STORAGE_KEY = 'consensus-proto-unlocked'

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  function submit(event: FormEvent) {
    event.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-white px-6">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[340px] flex-col gap-4 rounded-[16px] border border-line
          bg-white p-6 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16)]"
      >
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-[19px] font-medium leading-[28px] text-ink">Consensus</span>
        </div>

        <p className="m-0 text-[15.04px] font-medium leading-[23px] text-ink">
          This prototype is private
        </p>

        <div>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setError(false)
            }}
            placeholder="Password"
            aria-label="Password"
            aria-invalid={error}
            className={`h-10 w-full rounded-[12px] border bg-white px-3 text-[15px] text-ink
              placeholder:text-faint focus:outline-none ${
                error ? 'border-red' : 'border-line focus:border-accent'
              }`}
          />
          {error && (
            <p className="m-0 mt-1.5 text-[12.96px] leading-[20px] text-red">Incorrect password.</p>
          )}
        </div>

        <button type="submit" className="btn-accent h-10 w-full justify-center">
          Enter <Icon name="arrowRight" size={16} />
        </button>
      </form>
    </div>
  )
}
