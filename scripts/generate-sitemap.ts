/**
 * Generates public/sitemap.xml from the site's routes.
 * Run automatically before every build via `npm run build`.
 *
 * To add a page to the sitemap, add its route to `staticRoutes` below.
 * (Case studies aren't routed on the one-page site; the previous portfolio,
 * which derived them from src/data/projects.ts, is at the `portfolio-v1` tag.)
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const SITE_URL = 'https://benyamron.com'
const __dirname = dirname(fileURLToPath(import.meta.url))

const staticRoutes = [
  '/',
  '/havana/privacy',
  '/trio/privacy',
]

const allRoutes = staticRoutes

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
