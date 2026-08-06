import { useAppState } from '../state/AppState'
import { Composer } from './Composer'
import { homeSuggestions } from '../data/mockData'

export function HomeView() {
  const { startNewThread } = useAppState()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-accent text-xl">C</div>
        <h1 className="text-3xl font-medium text-text-primary">Research starts here</h1>
      </div>

      <Composer large placeholder="Ask the research..." onSubmit={startNewThread} />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {homeSuggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => startNewThread(s.query)}
            className="elevated rounded-control bg-surface-panel px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-surface-chip-secondary"
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-text-secondary">— The new standard for academic research —</p>
    </div>
  )
}
