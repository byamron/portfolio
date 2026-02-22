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
        padding: '64px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 24,
      }}
    >
      <ImageDisplay />
    </div>
  )
}
