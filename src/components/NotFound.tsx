import { Link } from 'react-router-dom'

/**
 * Catch-all not-found page for genuinely-unknown paths.
 *
 * Deep-linkable app routes (e.g. /project/flow) are handled by the SPA redirect:
 * 404.html re-encodes the path and index.html restores it before React Router boots.
 * Anything that still matches no route lands here.
 *
 * Rendered as a full-screen overlay (`position: fixed`) so the sidebar / right-column
 * chrome — which mounts outside <Routes> — doesn't clutter the 404. Colors use theme
 * tokens so it adapts to light/dark, unlike the old static 404.html.
 */
export function NotFound() {
  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        fontFamily: "'Onest', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <h1
          style={{
            fontFamily: "'Literata', serif",
            fontWeight: 300,
            fontSize: 36,
            color: 'var(--text-dark)',
            marginBottom: 16,
          }}
        >
          This page is gone
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: 'var(--text-grey)',
            marginBottom: 32,
          }}
        >
          It was probably part of an older version of my portfolio. The site has moved
          on — head to the homepage to see the current one.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            fontSize: 18,
            color: 'var(--text-dark)',
            textDecoration: 'none',
            padding: '12px 24px',
            border: '1px solid var(--text-underline)',
            borderRadius: 12,
          }}
        >
          Take me there
        </Link>
      </div>
    </main>
  )
}
