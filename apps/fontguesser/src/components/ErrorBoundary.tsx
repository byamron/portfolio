import { Component, type ReactNode } from 'react'

/**
 * The last line of defence against a white screen.
 *
 * Without a boundary, a single render exception unmounts the whole React tree
 * and leaves a blank page until reload — for a game people hit once a day, that
 * reads as broken. Here it becomes a recoverable message instead. Recovery is a
 * full reload rather than a boundary reset: whatever state produced the throw is
 * still in memory, so re-rendering it in place would just throw again — a reload
 * starts the round machine clean (and re-hands the same daily puzzle).
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // Kept so a real crash still surfaces in the console for diagnosis.
    console.error('Font Guesser hit an error:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="max-w-sm text-sm text-ink-muted">
          Something went wrong rendering this round. A reload will start you clean.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
        >
          Reload
        </button>
      </div>
    )
  }
}
