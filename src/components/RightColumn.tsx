import { ImageDisplay } from '@/components/ImageDisplay'

export function RightColumn() {
  return (
    <div
      className="right-column"
      style={{
        width: '50%',
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ImageDisplay />
    </div>
  )
}
