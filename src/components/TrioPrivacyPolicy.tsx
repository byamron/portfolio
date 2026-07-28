import { useEffect } from 'react'
import { Monitor, Sun, Moon } from '@phosphor-icons/react'
import { useTheme, type AppearanceMode } from '@/contexts/ThemeContext'

const modes: { mode: AppearanceMode; Icon: typeof Monitor; label: string }[] = [
  { mode: 'system', Icon: Monitor, label: 'System theme' },
  { mode: 'light', Icon: Sun, label: 'Light theme' },
  { mode: 'dark', Icon: Moon, label: 'Dark theme' },
]

export function TrioPrivacyPolicy() {
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
              Trio — To-Do List
            </p>
            <p style={{ fontSize: 14, color: textMuted }}>
              Last updated: March 2026
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

        <Section title="The Short Version" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>
              <strong>We don't collect your data.</strong> Your tasks and settings
              stay on your device and in your private iCloud account.
            </li>
            <li>
              <strong>We don't track you.</strong> No analytics, no advertising, no
              behavior tracking.
            </li>
            <li>
              <strong>We don't sell anything.</strong> We have no data to sell
              because we don't collect any.
            </li>
            <li>
              <strong>You're in control.</strong> You can delete all your data at
              any time through the app or your device settings.
            </li>
          </ul>
        </Section>

        <Section title="What Trio Stores" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Trio stores what you create while using the app. This data lives{' '}
            <strong>locally on your device</strong> and, if you have iCloud
            enabled, in <strong>your private iCloud account</strong>:
          </p>
          <ul>
            <li>
              <strong>Task information</strong> — titles, descriptions, due dates,
              creation/completion/deletion times, and how your tasks are ordered
              and prioritized.
            </li>
            <li>
              <strong>App settings</strong> — check-in times and notification
              preferences, haptics, onboarding state, appearance mode, and accent
              theme.
            </li>
            <li>
              <strong>Linear credentials (optional)</strong> — if you connect a
              Linear account, an OAuth access token is stored securely in your
              device's Keychain and used only to fetch your Linear issues for
              import. You can disconnect and delete it at any time from Settings.
            </li>
            <li>
              <strong>Check-in records (optional)</strong> — if you use check-ins,
              Trio stores check-in dates, completion counts, and any notes or mood
              ratings you provide.
            </li>
          </ul>
          <p>No email address, name, or account information is requested or stored.</p>
        </Section>

        <Section title="Where Your Data Lives" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            <strong>On your device.</strong> All your data is stored locally using
            Apple's SwiftData framework. It works offline, is protected by your
            device's security (passcode, Face ID, Touch ID), and is removed when
            you uninstall the app.
          </p>
          <p>
            <strong>In your iCloud (if enabled).</strong> If you're signed into
            iCloud, Trio automatically syncs your data using Apple's CloudKit into
            your <strong>private</strong> iCloud database, so your tasks appear on
            all your Apple devices. With Advanced Data Protection enabled, this
            data is end-to-end encrypted — even Apple cannot read it.{' '}
            <strong>We (the developer) cannot access your iCloud data.</strong> It
            belongs to you. If you're not signed into iCloud, Trio works normally
            and your data stays on that device only.
          </p>
        </Section>

        <Section title="What We Don't Do" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>
              <strong>No data collection.</strong> We do not collect, receive, or
              have access to your personal information or task data.
            </li>
            <li>
              <strong>No analytics or tracking.</strong> No Google Analytics,
              Firebase, Mixpanel, or similar. We have no idea how you use the app.
            </li>
            <li>
              <strong>No advertising.</strong> Trio contains no ads and shares no
              data with ad networks.
            </li>
            <li>
              <strong>No user accounts.</strong> No sign-up, no email collection,
              no passwords.
            </li>
            <li>
              <strong>No selling of data.</strong> We can't sell data we don't have.
            </li>
          </ul>
          <p>The only external services Trio connects to are:</p>
          <ul>
            <li>
              <strong>Apple CloudKit</strong> — for optional iCloud sync,
              controlled by Apple and protected by Apple's privacy policies.
            </li>
            <li>
              <strong>Linear (optional)</strong> — if you connect your account,
              Trio fetches your issues via Linear's API so you can import them. The
              connection is read-only; no task data is sent to Linear.
            </li>
            <li>
              <strong>Apple App Store Lookup API</strong> — used to display
              official app icons on the import screen. No personal data is sent.
            </li>
          </ul>
          <p>
            None of these services receive your task data, personal information, or
            usage analytics.
          </p>
        </Section>

        <Section title="How Long Your Data Is Kept" textSecondary={textSecondary} linkColor={linkColor}>
          <p>Your data persists as long as you keep it:</p>
          <ul>
            <li><strong>Active tasks</strong> remain until you complete or delete them.</li>
            <li><strong>Completed tasks</strong> remain until you delete them.</li>
            <li>
              <strong>Deleted tasks</strong> are soft-deleted for 30 days (allowing
              undo), then permanently removed.
            </li>
          </ul>
        </Section>

        <Section title="Your Rights and Choices" textSecondary={textSecondary} linkColor={linkColor}>
          <p>You can delete all your Trio data at any time:</p>
          <ul>
            <li>Delete individual tasks by swiping or using the delete option in the app.</li>
            <li>Delete local data by uninstalling the app.</li>
            <li>
              Delete iCloud data through Settings → [Your Name] → iCloud → Manage
              Storage → Trio → Delete Data.
            </li>
          </ul>
          <p>
            To stop syncing, turn off iCloud for Trio in Settings → [Your Name] →
            iCloud; your data will remain only on that device. Trio does not
            currently include a data export feature — your data stays accessible on
            your devices and through iCloud as long as you use the app.
          </p>
        </Section>

        <Section title="Children's Privacy" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Trio does not knowingly collect any information from children under 13.
            The app does not collect personal information from any users,
            regardless of age.
          </p>
        </Section>

        <Section title="Security" textSecondary={textSecondary} linkColor={linkColor}>
          <ul>
            <li>
              <strong>Local storage</strong> is protected by your device's built-in
              security (encryption, passcode, biometrics).
            </li>
            <li>
              <strong>iCloud storage</strong> uses Apple's security and optional
              end-to-end encryption.
            </li>
            <li>
              <strong>No transmission to our servers</strong> means there's no data
              for us to protect — or for anyone to breach.
            </li>
          </ul>
        </Section>

        <Section title="Your Privacy Rights (CCPA & GDPR)" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Because we don't collect personal information, there is no data for us
            to disclose, delete, or stop selling — you already have complete
            control through your device and iCloud settings. For iCloud storage,
            your data is subject to{' '}
            <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noreferrer">
              Apple's Privacy Policy
            </a>
            . We are not the data controller of your task information; you are.
          </p>
        </Section>

        <Section title="Changes to This Policy" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            If we make changes, we'll update the "Last updated" date above and post
            the new policy here and in the app. For significant changes, we'll
            provide notice within the app. Since we don't have your email address,
            we can't notify you directly — please check this policy periodically.
          </p>
        </Section>

        <Section title="Contact" textSecondary={textSecondary} linkColor={linkColor}>
          <p>
            Questions about this privacy policy or Trio's privacy practices?{' '}
            <a href="mailto:ben.yamron@gmail.com?subject=Trio%20Privacy%20Policy">
              ben.yamron@gmail.com
            </a>
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
