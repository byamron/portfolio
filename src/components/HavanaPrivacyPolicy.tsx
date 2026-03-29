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
              Last updated: March 28, 2026
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

        <Section title="Authentication" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            The app does not require account creation or sign-in. There is no
            authentication system — no user accounts, no passwords, and no user
            identifiers are generated or stored. Each installation is anonymous
            and self-contained.
          </p>
        </Section>

        <Section title="Data Stored on Your Device" textSecondary={textSecondary} linkColor={linkColor}>
          <p>The app stores the following data locally on your device:</p>
          <ul>
            <li>
              <strong>Gemini API key</strong> — stored in the iOS Keychain,
              encrypted and accessible only when your device is unlocked. This
              key is provided by you and is never sent to our servers.
            </li>
            <li>
              <strong>Session summaries</strong> — topic, themes, duration, and
              vocabulary notes from your conversations. These contain no
              personally identifiable information or verbatim quotes.
            </li>
            <li>
              <strong>Feed cards</strong> — language corrections derived from
              your conversations (what you said, a better alternative, and why).
              No personal information is included.
            </li>
            <li>
              <strong>Preferences</strong> — your selected language, learning
              goals, and app settings.
            </li>
          </ul>
          <p>No email address, name, or personal information is requested or stored.</p>
        </Section>

        <Section title="Data Sent to Third Parties" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            During a conversation, your voice audio is streamed directly to
            Google's Gemini API for real-time processing. After the conversation,
            your transcript is sent to Google's Gemini API once for analysis. In
            both cases:
          </p>
          <ul>
            <li>
              Audio and transcript data are processed in real time and are{' '}
              <strong>not stored on your device</strong>.
            </li>
            <li>
              Google's Gemini API (paid tier) does not use your data to train or
              improve Google products. Logs are retained briefly for abuse
              monitoring only.
            </li>
            <li>
              No data is sent to any server operated by us. All communication is
              directly between your device and Google's Gemini API.
            </li>
          </ul>
        </Section>

        <Section title="No Backend" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            The app has no backend server. There is no server-side storage of
            your data, no analytics collection, and no telemetry. Your data lives
            on your device and nowhere else (aside from the transient processing
            by Google's Gemini API described above).
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
