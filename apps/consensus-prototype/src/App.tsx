import { AppStateProvider, useAppState } from './state/AppState'
import { NavRail } from './components/NavRail'
import { HomeView } from './components/HomeView'
import { ThreadView } from './components/ThreadView'
import { CollectionView } from './components/CollectionView'
import { LibraryView } from './components/LibraryView'
import { ArtifactView } from './components/artifact/ArtifactView'
import { StubHintProvider } from './components/StubHint'
import { PasswordGate } from './components/PasswordGate'
import { SaveToCollectionPopover } from './components/SaveToCollectionPopover'

function Shell() {
  const { view } = useAppState()
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-panel">
      <NavRail />
      {view === 'home' && <HomeView />}
      {view === 'thread' && <ThreadView />}
      {view === 'collection' && <CollectionView />}
      {view === 'library' && <LibraryView />}
      {view === 'artifact' && <ArtifactView />}
      <SaveToCollectionPopover />
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
      <AppStateProvider>
        <StubHintProvider>
          <Shell />
        </StubHintProvider>
      </AppStateProvider>
    </PasswordGate>
  )
}
