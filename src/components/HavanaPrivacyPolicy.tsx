import { useEffect } from 'react'
import { Monitor, Sun, Moon } from '@phosphor-icons/react'
import { useTheme, type AppearanceMode } from '@/contexts/ThemeContext'

const modes: { mode: AppearanceMode; Icon: typeof Monitor; label: string }[] = [
  { mode: 'system', Icon: Monitor, label: 'System theme' },
  { mode: 'light', Icon: Sun, label: 'Light theme' },
  { mode: 'dark', Icon: Moon, label: 'Dark theme' },
]

export function HavanaPrivacyPolicy() {
  const { appearanceMode, setAppearanceMode, resolvedAppearance } = useTheme()
  const isDark = resolvedAppearance === 'dark'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const textColor = isDark ? '#e5e5e5' : '#1a1a1a'
  const textMuted = isDark ? '#a3a3a3' : '#525252'
  const textSecondary = isDark ? '#d4d4d4' : '#333333'
  const bg = isDark ? '#171717' : '#ffffff'
  const linkColor = isDark ? '#93c5fd' : '#2563eb'
  const toggleBg = isDark ? '#262626' : '#f5f5f5'
  const toggleActiveBg = isDark ? '#404040' : '#e5e5e5'

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.2s' }}>
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '64px 24px',
          fontFamily: "'Onest', sans-serif",
          color: textColor,
          lineHeight: 1.7,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
          <div>
            <h1
              style={{
                fontFamily: "'Literata', serif",
                fontWeight: 300,
                fontSize: 36,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ fontSize: 18, marginBottom: 4, fontWeight: 500 }}>
              Havana — Voice Language Practice
            </p>
            <p style={{ fontSize: 14, color: textMuted }}>
              Last updated: March 23, 2026
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 2,
              background: toggleBg,
              borderRadius: 10,
              padding: 3,
              marginTop: 8,
            }}
          >
            {modes.map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setAppearanceMode(mode)}
                aria-label={label}
                aria-pressed={appearanceMode === mode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: appearanceMode === mode ? toggleActiveBg : 'transparent',
                  color: appearanceMode === mode ? textColor : textMuted,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={16} weight={appearanceMode === mode ? 'bold' : 'regular'} />
              </button>
            ))}
          </div>
        </div>

        <Section title="Overview" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Havana is a voice-based language practice app. It is designed to
            collect as little data as possible. This policy explains what data the
            app handles, how it is stored, and what leaves your device.
          </p>
        </Section>

        <Section title="Data that stays on your device" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>
              <strong>Gemini API key</strong> — Stored in the iOS Keychain. Never
              sent to any server other than Google's Gemini API.
            </li>
            <li>
              <strong>Feed cards and spaced repetition state</strong> — Stored
              locally using SwiftData. Synced across your devices via iCloud if you
              have it enabled — Apple manages this data under their own{' '}
              <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>
              .
            </li>
            <li>
              <strong>App preferences</strong> — Language selection, goals, and
              settings stored locally via UserDefaults.
            </li>
          </ul>
        </Section>

        <Section title="Data processed in memory only" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>
              <strong>Voice audio</strong> — Captured by your device's microphone
              during a conversation session. Streamed directly to the Gemini API in
              real time. Never saved to disk.
            </li>
            <li>
              <strong>Conversation transcripts</strong> — Accumulated in memory
              during a session to generate feedback cards, then discarded. Never
              written to disk or sent to any server other than Google's Gemini API.
            </li>
          </ul>
        </Section>

        <Section title="Data sent to third parties" textSecondary={textSecondary} linkColor={linkColor}>
          <p>The app communicates with one external service:</p>
          <ul>
            <li>
              <strong>Google Gemini API</strong> — Audio and text are sent to
              Google's Gemini API using your personal API key. Google's data
              handling is governed by the{' '}
              <a href="https://developers.google.com/terms" target="_blank" rel="noopener noreferrer">
                Google API Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
              . Havana has no control over how Google processes this data.
            </li>
          </ul>
        </Section>

        <Section title="Data we do not collect" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>No analytics or usage tracking</li>
            <li>No advertising identifiers</li>
            <li>No crash reporting to third-party services</li>
            <li>No email addresses, names, or account information</li>
            <li>No server-side storage of conversations, audio, or personal data</li>
          </ul>
        </Section>

        <Section title="Authentication" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            The app uses Sign in with Apple for authentication. Apple provides an
            anonymous, app-scoped user identifier — no email address or personal
            information is requested or stored.
          </p>
        </Section>

        <Section title="Children" textSecondary={textSecondary} linkColor={linkColor}>
          <p>Havana is not intended for users under 17.</p>
        </Section>

        <Section title="Changes" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            If this policy changes, the updated version will be posted here with a
            new "last updated" date.
          </p>
        </Section>

        <Section title="Contact" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Questions about this policy can be sent to{' '}
            <a href="mailto:ben.yamron@gmail.com">ben.yamron@gmail.com</a>.
          </p>
        </Section>
      </main>
    </div>
  )
}

function Section({
  title,
  children,
  textSecondary,
  linkColor,
}: {
  title: string
  children: React.ReactNode
  textSecondary: string
  linkColor: string
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: "'Literata', serif",
          fontWeight: 300,
          fontSize: 24,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <style>{`section a { color: ${linkColor}; }`}</style>
      <div style={{ fontSize: 16, color: textSecondary }}>
        {children}
      </div>
    </section>
  )
}
