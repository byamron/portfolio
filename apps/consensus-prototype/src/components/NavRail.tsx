import type { ReactNode } from 'react'
import { useAppState } from '../state/AppState'
import { Icon, Logo } from './icons'
import { useStub } from './StubHint'
import { ThreadMenu } from './ThreadMenu'
import { AccountMenu } from './AccountMenu'

/**
 * My Library is a structurally distinct shell in the product — the rail swaps
 * to a reduced Back Home / My Library / Collections tree. Both shapes live here.
 */
export function NavRail() {
  const {
    view,
    collections,
    selectedCollectionId,
    goHome,
    openCollection,
    openLibrary,
    openThread,
    threads,
    recentThreadIds,
    activeThreadId,
  } = useAppState()
  const stub = useStub()
  const inLibrary = view === 'collection' || view === 'library' || view === 'artifact'
  /** A collection row lights up only when you are actually inside one. */
  const inCollection = view === 'collection' || view === 'artifact'
  const roots = Object.values(collections).filter((c) => c.parentId === null)
  const childrenOf = (parentId: string) =>
    Object.values(collections).filter((c) => c.parentId === parentId)

  return (
    <nav className="flex w-52 shrink-0 flex-col border-r border-line bg-rail">
      <div className="flex min-h-16 items-center justify-between px-4 pr-2">
        <button type="button" onClick={goHome} aria-label="Consensus home" title="Home">
          <Logo size={24} />
        </button>
        <button
          type="button"
          className="icon-btn size-9"
          aria-label="Toggle sidebar"
          onClick={(e) => stub(e, 'Collapse the navigation rail')}
        >
          <Icon name="panel" size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="scroll-y px-2 pb-2">
        {inLibrary ? (
          <>
            <RailButton icon="arrowLeft" label="Back Home" onClick={goHome} />
            {/* A collection is inside the library, so selecting one selects its
                parent too. The library on its own selects only itself. */}
            <RailButton
              icon="bookmark"
              label="My Library"
              active={inLibrary}
              onClick={openLibrary}
            />
            <div className="label px-2 pb-1 pt-4 text-muted">Collections</div>
            {roots.map((collection) => (
              <div key={collection.id}>
                <RailButton
                  icon="folder"
                  label={collection.name}
                  active={inCollection && collection.id === selectedCollectionId}
                  onClick={() => openCollection(collection.id)}
                />
                {/* Collections nest — the product goes at least two deep. */}
                {childrenOf(collection.id).map((child) => (
                  <RailButton
                    key={child.id}
                    icon="folder"
                    label={child.name}
                    indent
                    active={inCollection && child.id === selectedCollectionId}
                    onClick={() => openCollection(child.id)}
                  />
                ))}
              </div>
            ))}
          </>
        ) : (
          <>
            <RailButton icon="plus" label="New Thread" onClick={goHome} />
            <RailButton icon="home" label="Home" active={view === 'home'} onClick={goHome} />
            <RailButton icon="bookmark" label="My Library" onClick={openLibrary} />
            <RailButton icon="history" label="History" onClick={goHome} />
            <div className="label px-2 pb-1 pt-4 text-muted">Recents</div>
            {recentThreadIds.length === 0 && (
              <p className="m-0 px-2 py-1 text-[12.96px] leading-[20px] text-faint">
                No threads yet. Ask a question to start one.
              </p>
            )}
            {recentThreadIds.slice(0, 8).map((id) => (
              <RailButton
                key={id}
                icon="chat"
                label={threads[id].title}
                active={id === activeThreadId}
                onClick={() => openThread(id)}
                menu={<ThreadMenu threadId={id} />}
              />
            ))}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line px-2 py-3">
        <AccountMenu />
        <button
          type="button"
          className="btn mt-2 w-full"
          onClick={(e) => stub(e, 'Upgrade to Consensus Pro')}
        >
          Upgrade
        </button>
      </div>
    </nav>
  )
}

function RailButton({
  icon,
  label,
  active,
  indent,
  onClick,
  menu,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  active?: boolean
  indent?: boolean
  onClick: () => void
  /** Row actions, revealed on hover so the rail stays quiet at rest. */
  menu?: ReactNode
}) {
  return (
    <div
      className={`group relative flex h-9 w-full items-center rounded-[12px] ${
        active ? 'bg-line/70' : 'hover:bg-fill'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex h-9 min-w-0 grow items-center gap-2 rounded-[12px] px-2 text-left text-[15.04px] font-medium leading-[23px] text-ink ${
          indent ? 'pl-6' : ''
        }`}
      >
        <span className="flex size-7 shrink-0 items-center justify-center text-muted">
          <Icon name={icon} size={16} />
        </span>
        <span className="truncate">{label}</span>
      </button>
      {menu && (
        <span className="mr-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {menu}
        </span>
      )}
    </div>
  )
}
