import { AppStateProvider, useAppState } from './state/AppState'
import { PasswordGate } from './components/PasswordGate'
import { NavRail } from './components/NavRail'
import { HomeView } from './components/HomeView'
import { ThreadView } from './components/ThreadView'
import { LibraryView } from './components/LibraryView'
import { PaperDetailPanel } from './components/PaperDetailPanel'
import { SaveToCollectionPopover } from './components/SaveToCollectionPopover'

function Shell() {
  const { view } = useAppState()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-app text-text-primary">
      <NavRail />
      {view === 'home' && <HomeView />}
      {view === 'thread' && <ThreadView />}
      {view === 'library' && <LibraryView />}
      <PaperDetailPanel />
      <SaveToCollectionPopover />
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
      <AppStateProvider>
        <Shell />
      </AppStateProvider>
    </PasswordGate>
  )
}
