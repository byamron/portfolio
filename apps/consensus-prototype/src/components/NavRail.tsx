import { useAppState } from '../state/AppState'
import { recentThreadTitles } from '../data/mockData'
import { PlusIcon, HomeIcon, BookmarkIcon, HistoryIcon, ChatIcon, SearchIcon, GraphIcon, FolderIcon } from './icons'

function Logo() {
  return (
    <div className="flex h-16 shrink-0 items-center px-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
        C
      </div>
    </div>
  )
}

function NavItem({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active?: boolean
  badge?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-2 rounded-xl pl-1 pr-2 text-left text-[15.04px] font-medium leading-[22.56px] text-text-primary ${
        active ? 'bg-surface-chip-secondary' : 'hover:bg-surface-panel'
      }`}
    >
      {badge ? (
        <span className="elevated-accent flex size-7 shrink-0 items-center justify-center rounded-xl bg-nav-active text-text-primary">
          {icon}
        </span>
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center text-text-primary">{icon}</span>
      )}
      {label}
    </button>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 px-4 pb-1 text-[12.96px] font-medium leading-[19.52px] text-text-secondary">{children}</div>
  )
}

function Footer() {
  return (
    <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-3 pt-3 text-[13px] text-text-secondary">
      <a className="hover:text-text-primary" href="#learn">
        Learn ↗
      </a>
      <a className="hover:text-text-primary" href="#contact">
        Contact ↗
      </a>
      <div className="mt-1 flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-chip text-xs text-text-primary">
          B
        </span>
        <span className="truncate">ben.yamron@iclo…</span>
      </div>
      <span>3 / 15 Pro messages left</span>
      <button type="button" className="elevated rounded-control bg-surface-panel px-2 py-1.5 text-text-primary">
        Upgrade
      </button>
    </div>
  )
}

export function NavRail() {
  const { view, goHome, goLibrary, openThread, collections, selectedCollectionId, selectCollection } = useAppState()

  if (view === 'library') {
    const topLevel = Object.values(collections).filter((c) => !c.parentId)

    return (
      <aside className="flex h-full w-52 shrink-0 flex-col bg-surface-rail">
        <Logo />
        <div className="flex flex-col px-2">
          <button
            type="button"
            onClick={goHome}
            className="flex h-9 items-center gap-2 rounded-xl pl-1 pr-2 text-left text-[15.04px] text-text-secondary hover:bg-surface-panel hover:text-text-primary"
          >
            ← Back Home
          </button>
          <NavItem label="My Library" icon={<BookmarkIcon />} active />
        </div>

        <SectionHeader>Collections</SectionHeader>
        <div className="flex flex-col px-2">
          {topLevel.map((collection) => (
            <div key={collection.id}>
              <NavItem
                label={collection.name}
                icon={<FolderIcon />}
                active={selectedCollectionId === collection.id}
                onClick={() => selectCollection(collection.id)}
              />
              {Object.values(collections)
                .filter((c) => c.parentId === collection.id)
                .map((child) => (
                  <div key={child.id} className="relative pl-4">
                    <span className="absolute left-1 top-1 h-6 w-px bg-border" aria-hidden />
                    <NavItem
                      label={child.name}
                      icon={<FolderIcon />}
                      active={selectedCollectionId === child.id}
                      onClick={() => selectCollection(child.id)}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>

        <Footer />
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col bg-surface-rail">
      <Logo />
      <div className="flex flex-col px-2">
        <NavItem label="New Thread" icon={<PlusIcon size={20} className="text-white" />} badge onClick={goHome} />
        <NavItem label="Home" icon={<HomeIcon />} active={view === 'home'} onClick={goHome} />
        <NavItem label="My Library" icon={<BookmarkIcon />} onClick={() => goLibrary()} />
        <NavItem label="History" icon={<HistoryIcon />} />
      </div>

      <SectionHeader>Recents</SectionHeader>
      <div className="flex flex-col px-2">
        {recentThreadTitles.map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => (title.startsWith('Creatine Effects') ? openThread('creatine-effects') : undefined)}
            className="flex h-8 items-center gap-2 truncate rounded-xl px-1 text-left text-[12.96px] leading-[19.52px] text-text-secondary hover:bg-surface-panel hover:text-text-primary"
          >
            <ChatIcon size={14} className="shrink-0" /> <span className="truncate">{title}</span>
          </button>
        ))}
      </div>

      <SectionHeader>Tools</SectionHeader>
      <div className="flex flex-col px-2 text-text-secondary">
        <div className="flex h-8 items-center gap-2 px-1 text-[12.96px] leading-[19.52px]">
          <SearchIcon size={14} /> Paper search
        </div>
        <div className="flex h-8 items-center gap-2 px-1 text-[12.96px] leading-[19.52px]">
          <GraphIcon size={14} /> Citation Graph
        </div>
      </div>

      <Footer />
    </aside>
  )
}
