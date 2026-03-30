/**
 * Generates public/sitemap.xml from project data + known routes.
 * Run automatically before every build via `npm run build`.
 *
 * To add a page to the sitemap, either:
 *   - Add a project with `isLink: true` and a `caseStudySlug` in src/data/projects.ts
 *   - Add a static route to the `staticRoutes` array below
 */

import { sections } from '../src/data/projects.js'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const SITE_URL = 'https://benyamron.com'
const __dirname = dirname(fileURLToPath(import.meta.url))

// Routes that aren't derived from project data
const staticRoutes = [
  '/',
  '/havana/privacy',
]

// Derive project routes from the source of truth
const projectRoutes = sections
  .flatMap(s => s.projects)
  .filter(p => p.isLink && p.caseStudySlug)
  .map(p => `/project/${p.caseStudySlug}`)

const allRoutes = [...staticRoutes, ...projectRoutes]

const today = new Date().toISOString().split('T')[0]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route, i) =>
      `  <url>
    <loc>${SITE_URL}${route}</loc>${i === 0 ? `\n    <priority>1.0</priority>` : ''}
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`

const outPath = resolve(__dirname, '../public/sitemap.xml')
writeFileSync(outPath, sitemap, 'utf-8')
console.log(`Sitemap generated → ${allRoutes.length} URLs → public/sitemap.xml`)
