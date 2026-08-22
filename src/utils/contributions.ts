import contributionData from '@/data/contributions.json'

export interface ContributionDay {
  date: string
  contributionCount: number
  level: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
  fetchedAt: string | null
}

const data = contributionData as ContributionData

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Colour scale — reused verbatim from the pre-strip heatmap component. */
export function contribFill(count: number, maxCount: number, hue: number, t: number, isDark: boolean): string {
  if (count === 0) {
    if (isDark) return `hsla(${hue}, 8%, ${50 + t * 10}%, 0.05)`
    return `hsla(${hue}, 8%, ${50 - t * 15}%, 0.05)`
  }
  const intensity = Math.sqrt(count / maxCount)
  const alpha = 0.18 + intensity * 0.72
  const sat = 30 + intensity * 40
  if (isDark) {
    const lightness = 50 + t * 10
    return `hsla(${hue}, ${sat + t * 15}%, ${lightness}%, ${alpha})`
  }
  const lightness = 50 - t * 15
  return `hsla(${hue}, ${sat + t * 10}%, ${lightness}%, ${alpha})`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  return `${month} ${day}${suffix}`
}

/**
 * `today` defaults to a fresh read, but callers holding a frozen value (e.g.
 * `buildContributionDays()`'s `today`, computed once at mount) should pass it
 * explicitly — otherwise a session left open across a midnight boundary can
 * have the last square's date silently stop matching a re-computed "today".
 */
export function getTooltipText(date: string, count: number, today?: string): string {
  if (today === undefined) {
    const now = new Date()
    today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  }
  if (date === today) return `Today, ${formatDate(date)} — contributions in progress`
  if (date > today) return 'No contributions (yet)'
  return `${count} contribution${count !== 1 ? 's' : ''} on ${formatDate(date)}`
}

export interface ContributionStripData {
  days: ContributionDay[]
  total: number
  max: number
  year: number
  today: string
}

/**
 * Calendar year-to-date, ascending, with today always the last entry.
 * The daily fetch can lag a day or two; missing trailing dates are
 * appended as zero-count so today is never absent from the strip.
 */
export function buildContributionDays(): ContributionStripData {
  const now = new Date()
  const year = now.getFullYear()
  const today = `${year}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  const yearStart = `${year}-01-01`

  const days: ContributionDay[] = []
  for (const week of data.weeks) {
    for (const day of week.contributionDays) {
      if (day.date >= yearStart && day.date <= today) days.push(day)
    }
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1))

  if (days.length === 0 || days[days.length - 1]?.date !== today) {
    const cursor = days.length
      ? new Date(days[days.length - 1]!.date + 'T00:00:00')
      : new Date(year, 0, 1)
    const end = new Date(today + 'T00:00:00')
    while (cursor < end) {
      cursor.setDate(cursor.getDate() + 1)
      days.push({
        date: `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`,
        contributionCount: 0,
        level: 0,
      })
    }
  }

  const total = days.reduce((sum, d) => sum + d.contributionCount, 0)
  const max = Math.max(1, ...days.map(d => d.contributionCount))

  return { days, total, max, year, today }
}
