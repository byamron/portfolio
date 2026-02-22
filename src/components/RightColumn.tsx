import portraitTable from '@/assets/images/portrait-table.jpeg'

export function RightColumn() {
  return (
    <aside
      style={{
        width: '50%',
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        padding: '64px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 528, height: 720, borderRadius: 32, overflow: 'hidden' }}>
        <img
          src={portraitTable}
          alt="Ben Yamron portrait"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </aside>
  )
}
