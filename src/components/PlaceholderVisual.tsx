interface PlaceholderVisualProps {
  caption?: string
  style?: React.CSSProperties
}

export function PlaceholderVisual({ caption, style }: PlaceholderVisualProps) {
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', gap: 24, ...style }}>
      <div
        role="img"
        aria-label={caption || 'Placeholder image'}
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          backgroundColor: 'var(--text-light-grey)',
          borderRadius: 32,
          transition: 'background-color 500ms ease-in-out',
        }}
      />
      {caption && (
        <figcaption
          style={{
            fontSize: 'var(--text-size-caption)',
            lineHeight: 1.4,
            color: 'var(--text-grey)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
