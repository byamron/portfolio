interface PlaceholderVisualProps {
  caption?: string
  style?: React.CSSProperties
  /** If provided, renders a live iframe instead of a placeholder box */
  prototypeSrc?: string
  /** Override the default aspect ratio (default: '16 / 10') */
  aspectRatio?: string
}

export function PlaceholderVisual({ caption, style, prototypeSrc, aspectRatio }: PlaceholderVisualProps) {
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', gap: 24, ...style }}>
      {prototypeSrc ? (
        <iframe
          src={prototypeSrc}
          title={caption || 'Live prototype'}
          style={{
            width: '100%',
            aspectRatio: aspectRatio || '16 / 10',
            border: 'none',
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: 'var(--text-light-grey)',
          }}
        />
      ) : (
        <div
          role="img"
          aria-label={caption || 'Placeholder image'}
          style={{
            width: '100%',
            aspectRatio: aspectRatio || '16 / 10',
            backgroundColor: 'var(--text-light-grey)',
            borderRadius: 32,
            transition: 'background-color 500ms ease-in-out',
          }}
        />
      )}
      {caption && (
        <figcaption
          style={{
            fontSize: 14,
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
