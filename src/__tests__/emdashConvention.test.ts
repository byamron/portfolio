import { describe, it, expect } from 'vitest'
import { caseStudiesBySlug } from '@/data/case-study-content'
import { sections } from '@/data/projects'

// Typography convention: every em-dash (U+2014) in rendered copy is thin-space
// wrapped (U+2009 on both sides), never regular-space (U+0020). See core-docs/plan.md.
const THIN = String.fromCharCode(0x2009)
const EM = String.fromCharCode(0x2014)

function collectStrings(): { ctx: string; text: string }[] {
  const out: { ctx: string; text: string }[] = []
  for (const [slug, cs] of Object.entries(caseStudiesBySlug)) {
    out.push({ ctx: `${slug}.subtitle`, text: cs.subtitle })
    cs.narrative.forEach((p, i) => out.push({ ctx: `${slug}.narrative[${i}]`, text: p }))
    cs.sections?.forEach((s, si) => {
      out.push({ ctx: `${slug}.sections[${si}].heading`, text: s.heading })
      s.paragraphs.forEach((p, pi) =>
        out.push({ ctx: `${slug}.sections[${si}].paragraphs[${pi}]`, text: p }),
      )
    })
  }
  sections.forEach((section, si) => {
    const label = section.label ?? `#${si}`
    section.context.forEach((p, i) => out.push({ ctx: `section ${label}.context[${i}]`, text: p }))
    for (const proj of section.projects) {
      if (proj.summary) out.push({ ctx: `project ${proj.id}.summary`, text: proj.summary })
      if (proj.previewDescription)
        out.push({ ctx: `project ${proj.id}.previewDescription`, text: proj.previewDescription })
    }
  })
  return out
}

describe('em-dash typography convention', () => {
  it('every em-dash in rendered copy is thin-space-wrapped (U+2009), never regular-space', () => {
    const violations: string[] = []
    for (const { ctx, text } of collectStrings()) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] !== EM) continue
        if (text[i - 1] !== THIN || text[i + 1] !== THIN) {
          violations.push(`${ctx}: "...${text.slice(Math.max(0, i - 15), i + 15)}..."`)
        }
      }
    }
    expect(violations, `Non-thin em-dashes found:\n${violations.join('\n')}`).toEqual([])
  })
})
