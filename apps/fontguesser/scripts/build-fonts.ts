/**
 * Vendors the Google Fonts library into a static manifest.
 *
 * Everything here runs at build time so the game itself has zero runtime
 * dependency on Google's metadata endpoint or on GitHub. Run with `npm run fonts`.
 *
 * Three sources, none of which need an API key:
 *   1. fonts.google.com/metadata/fonts  — the family list, with popularity rank,
 *      category, designers, and subsets.
 *   2. github.com/google/fonts           — DESCRIPTION.en_us.html per family, the
 *      prose shown in the reveal. This is the good stuff: provenance, influences,
 *      what the design is actually for.
 *   3. fonts.google.com/metadata/fonts/{family} — per-family numeric attributes
 *      (thickness, width, slant), shown in the reveal as a fingerprint.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data')

/**
 * The manifest ships as two files. The index is needed the moment the game
 * loads — it backs the combobox and the daily draw — and stays small enough to
 * bundle. The prose is ~1MB and is only needed once a round has been answered,
 * so it is lazily imported at the reveal.
 */
const INDEX_OUT = resolve(DATA_DIR, 'font-index.json')
const ABOUT_OUT = resolve(DATA_DIR, 'font-about.json')

/** Google prefixes its JSON endpoints with an anti-hijacking guard. */
const stripGuard = (s: string) => s.replace(/^\)\]\}'\n?/, '')

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return JSON.parse(stripGuard(await res.text())) as T
}

/** Runs `work` over `items` with bounded concurrency, so we stay polite to the origin. */
async function pooled<T, R>(items: T[], limit: number, work: (item: T, i: number) => Promise<R>) {
  const out = new Array<R>(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++
        out[i] = await work(items[i], i)
      }
    }),
  )
  return out
}

type RawFamily = {
  family: string
  category: string
  subsets: string[]
  designers: string[]
  popularity: number
  dateAdded: string
  isNoto: boolean
  /** ISO 15924 code. Absent for families designed for Latin in the first place. */
  primaryScript?: string
  /** Keyed by weight, with an `i` suffix for italics: "400", "700", "400i". */
  fonts: Record<string, unknown>
  axes: { tag: string; min: number; max: number; defaultValue: number }[]
}

type TreeEntry = { path: string }

/**
 * Turns DESCRIPTION.en_us.html into plain paragraphs.
 *
 * The source is hand-written HTML with links and occasional markup; we want the
 * prose only, since the reveal sets it in the font being revealed and stray
 * anchors would fight the typography.
 */
/** The handful of named entities the descriptions actually use beyond the basics. */
const NAMED: Record<string, string> = {
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  iacute: 'í',
  oacute: 'ó',
  ocirc: 'ô',
  uacute: 'ú',
  uuml: 'ü',
  ouml: 'ö',
  auml: 'ä',
  ccedil: 'ç',
  ntilde: 'ñ',
  aring: 'å',
  oslash: 'ø',
  szlig: 'ß',
  zwnj: '',
  zwj: '',
  shy: '',
}

function htmlToParagraphs(html: string): string[] {
  return html
    .split(/<\/p>/i)
    .map((chunk) =>
      chunk
        .replace(/<[^>]+>/g, '')
        // Named entities first, then numeric. `&amp;` is decoded last so that a
        // double-encoded `&amp;quot;` doesn't collapse into a stray quote.
        .replace(/&nbsp;/g, ' ')
        .replace(/&apos;|&#39;|&rsquo;|&lsquo;/g, '’')
        .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/&hellip;/g, '…')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&([a-z]+);/gi, (match, name: string) =>
          name.toLowerCase() in NAMED ? NAMED[name.toLowerCase()] : match,
        )
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((p) => p.length > 0)
}

async function main() {
  console.log('Fetching family metadata…')
  const meta = await getJSON<{ familyMetadataList: RawFamily[] }>(
    'https://fonts.google.com/metadata/fonts',
  )

  // Three filters, all about making a wrong answer feel fair:
  //
  //   - Latin subset, obviously, since the specimen is set in English.
  //   - No Noto. The superfamily is ~330 near-identical script faces that
  //     nobody can tell apart, which reads as random rather than hard.
  //   - Latin-primary only. A Korean or Devanagari family ships Latin glyphs as
  //     a supporting afterthought; asking someone to name one from a paragraph
  //     of English is asking them to recognise a face by the part of it that
  //     nobody designed for that purpose.
  const families = meta.familyMetadataList
    .filter(
      (f) =>
        f.subsets.includes('latin') &&
        !f.isNoto &&
        (!f.primaryScript || f.primaryScript === 'Latn'),
    )
    .sort((a, b) => a.popularity - b.popularity)

  console.log(`  ${families.length} latin families after filtering`)

  // Usage figures, the same numbers Google shows on a specimen page. One
  // request covers the whole library.
  console.log('Fetching usage stats…')
  type Stat = {
    family: string
    totalViews: number
    viewsByDateRange?: Record<string, { views: number }>
  }
  const stats = await getJSON<Stat[]>('https://fonts.google.com/metadata/stats')
  const statsBy = new Map(stats.map((s) => [s.family, s]))
  console.log(`  ${stats.length} families with usage data`)

  console.log('Fetching google/fonts tree…')
  const tree = await getJSON<{ tree: TreeEntry[]; truncated: boolean }>(
    'https://api.github.com/repos/google/fonts/git/trees/main?recursive=1',
  )
  if (tree.truncated) throw new Error('repo tree was truncated; cannot resolve descriptions')

  // Map normalised family name -> description path. Directory names are the
  // family lowercased with all non-alphanumerics removed.
  const descPaths = new Map<string, string>()
  for (const entry of tree.tree) {
    if (!entry.path.endsWith('DESCRIPTION.en_us.html')) continue
    descPaths.set(entry.path.split('/')[1], entry.path)
  }
  const normalise = (family: string) => family.toLowerCase().replace(/[^a-z0-9]/g, '')

  console.log(`Fetching descriptions and attributes for ${families.length} families…`)
  let done = 0
  const entries = await pooled(families, 16, async (f) => {
    const path = descPaths.get(normalise(f.family))

    const [about, attrs] = await Promise.all([
      path
        ? fetch(`https://raw.githubusercontent.com/google/fonts/main/${path}`)
            .then((r) => (r.ok ? r.text() : ''))
            .then(htmlToParagraphs)
            .catch(() => [] as string[])
        : Promise.resolve([] as string[]),
      getJSON<{ fonts: Record<string, { thickness: number | null; width: number | null; slant: number | null }> }>(
        `https://fonts.google.com/metadata/fonts/${encodeURIComponent(f.family)}`,
      )
        .then((d) => d.fonts?.['400'] ?? null)
        .catch(() => null),
    ])

    if (++done % 200 === 0) console.log(`  ${done}/${families.length}`)

    // Roman weights only. Italics double the download for a control the game
    // doesn't offer, and many families ship italics that differ enough to
    // confuse rather than inform.
    const weights = Object.keys(f.fonts ?? {})
      .filter((k) => !k.endsWith('i'))
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)

    const wght = (f.axes ?? []).find((a) => a.tag === 'wght')

    return {
      family: f.family,
      category: f.category,
      designers: f.designers ?? [],
      dateAdded: f.dateAdded,
      /** 1-based rank within our filtered pool — the basis for both tiering and the hint. */
      rank: 0,
      /** Weights the specimen control can offer. Always at least one. */
      weights: weights.length > 0 ? weights : [400],
      /** Present when the family is variable on weight: [min, max], one file covers the range. */
      wghtAxis: wght ? ([wght.min, wght.max] as [number, number]) : null,
      variable: (f.axes ?? []).length > 0,
      totalViews: statsBy.get(f.family)?.totalViews ?? null,
      weekViews: statsBy.get(f.family)?.viewsByDateRange?.['7day']?.views ?? null,
      thickness: attrs?.thickness ?? null,
      width: attrs?.width ?? null,
      about,
    }
  })

  entries.forEach((e, i) => (e.rank = i + 1))

  const withAbout = entries.filter((e) => e.about.length > 0).length
  console.log(`  ${withAbout}/${entries.length} have about-text`)

  // Index: everything needed to draw a round and populate the combobox.
  const index = entries.map((e) => ({
    family: e.family,
    category: e.category,
    rank: e.rank,
    variable: e.variable,
    weights: e.weights,
    wghtAxis: e.wghtAxis,
  }))

  // About: the reveal payload, keyed by family.
  const about = Object.fromEntries(
    entries.map((e) => [
      e.family,
      {
        designers: e.designers,
        dateAdded: e.dateAdded,
        totalViews: e.totalViews,
        weekViews: e.weekViews,
        thickness: e.thickness,
        width: e.width,
        about: e.about,
      },
    ]),
  )

  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(INDEX_OUT, JSON.stringify(index))
  await writeFile(ABOUT_OUT, JSON.stringify(about))

  const kb = async (p: string) =>
    ((await import('node:fs')).statSync(p).size / 1024).toFixed(0) + ' KB'
  console.log(`Wrote ${INDEX_OUT} (${await kb(INDEX_OUT)})`)
  console.log(`Wrote ${ABOUT_OUT} (${await kb(ABOUT_OUT)})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
