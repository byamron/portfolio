import { useState, type FormEvent, type ReactNode } from 'react'

// Client-side only — this is a public static build, so this keeps casual visitors
// and search engines out, not a real access control. Don't put anything sensitive here.
const PASSWORD = 'consensus'
const STORAGE_KEY = 'consensus-proto-unlocked'

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  function submit(e: FormEvent) {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-app text-text-primary">
      <form
        onSubmit={submit}
        className="flex w-72 flex-col gap-3 rounded-composer border border-border bg-surface-panel p-6"
      >
        <p className="text-[15px] font-medium">This prototype is private.</p>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(false)
          }}
          placeholder="Password"
          className="rounded-control border border-border bg-surface-app px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
        {error && <p className="text-[13px] text-[#ff6b6b]">Incorrect password.</p>}
        <button type="submit" className="rounded-control bg-accent px-3 py-2 text-[14px] font-medium text-white">
          Enter
        </button>
      </form>
    </div>
  )
}
