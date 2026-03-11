/**
 * Fetches GitHub contribution calendar data via GraphQL API
 * and writes it to src/data/contributions.json.
 *
 * Usage: GITHUB_TOKEN=<pat> npx tsx scripts/fetch-contributions.ts
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../src/data/contributions.json')

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

const query = `{
  viewer {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}`

// GitHub uses a 5-level color scale. Map hex → level 0-4.
const COLOR_TO_LEVEL: Record<string, number> = {
  '#ebedf0': 0, // none (light theme)
  '#9be9a8': 1, // low
  '#40c463': 2, // medium
  '#30a14e': 3, // high
  '#216e39': 4, // max
  // Dark theme variants
  '#161b22': 0,
  '#0e4429': 1,
  '#006d32': 2,
  '#26a641': 3,
  '#39d353': 4,
}

function colorToLevel(hex: string): number {
  return COLOR_TO_LEVEL[hex.toLowerCase()] ?? 0
}

interface GitHubDay {
  date: string
  contributionCount: number
  color: string
}

interface GitHubWeek {
  contributionDays: GitHubDay[]
}

async function main() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required')
    process.exit(1)
  }

  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    console.error(`GitHub API error: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const json = await res.json()

  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2))
    process.exit(1)
  }

  const calendar = json.data.viewer.contributionsCollection.contributionCalendar
  const totalContributions: number = calendar.totalContributions

  const weeks = calendar.weeks.map((week: GitHubWeek) => ({
    contributionDays: week.contributionDays.map((day: GitHubDay) => ({
      date: day.date,
      contributionCount: day.contributionCount,
      level: colorToLevel(day.color),
    })),
  }))

  const output = {
    totalContributions,
    weeks,
    fetchedAt: new Date().toISOString(),
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n')
  console.log(
    `Wrote ${weeks.length} weeks (${totalContributions} contributions) to ${OUTPUT_PATH}`
  )
}

main()
