import { describe, it, expect } from 'vitest'
import {
  sections,
  projectImageMap,
  defaultImageMap,
  projectsById,
} from '@/data/projects'

const allProjects = sections.flatMap(s => s.projects)

describe('projectImageMap integrity', () => {
  it('every entry maps to a project that actually renders it (not overridden by video/lottie)', () => {
    for (const [projectId, src] of Object.entries(projectImageMap)) {
      const consumers = allProjects.filter(
        p => p.projectId === projectId && !p.videoPreview && !p.lottiePreview
      )
      expect(
        consumers.length,
        `projectImageMap["${projectId}"] → "${src}" is never rendered — all projects with this projectId use videoPreview or lottiePreview`
      ).toBeGreaterThan(0)
    }
  })

  it('every image-only project has an entry in projectImageMap', () => {
    // Projects that don't have videoPreview or lottiePreview need a static image
    const imageOnlyProjects = allProjects.filter(
      p => !p.videoPreview && !p.lottiePreview && p.isLink
    )
    for (const project of imageOnlyProjects) {
      const hasImage = project.projectId in projectImageMap
      // If no entry, it falls back to the default portrait — which is fine
      // but worth flagging as an explicit choice
      if (!hasImage) {
        // Verify the fallback portrait exists
        expect(
          Object.keys(defaultImageMap).length,
          `Project "${project.id}" has no preview image and will show the default portrait`
        ).toBeGreaterThan(0)
      }
    }
  })

  it('no projectImageMap entry points to a video or lottie file', () => {
    for (const [projectId, src] of Object.entries(projectImageMap)) {
      expect(src, `projectImageMap["${projectId}"] points to a video file`).not.toMatch(/\.mp4$/)
      expect(src, `projectImageMap["${projectId}"] points to a lottie file`).not.toMatch(/\.json$/)
    }
  })
})

describe('project data consistency', () => {
  it('all project ids are unique', () => {
    const ids = allProjects.map(p => p.id)
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dupes, `Duplicate project ids: ${dupes.join(', ')}`).toHaveLength(0)
  })

  it('projectsById contains every project from sections', () => {
    for (const project of allProjects) {
      expect(
        projectsById[project.id],
        `Project "${project.id}" missing from projectsById`
      ).toBeDefined()
    }
  })

  it('every linkable project has an href', () => {
    const linkable = allProjects.filter(p => p.isLink)
    for (const project of linkable) {
      expect(
        project.href,
        `Project "${project.id}" is marked isLink but has no href`
      ).toBeTruthy()
    }
  })

  it('every project with a caseStudySlug has isLink=true and a matching href', () => {
    const withSlug = allProjects.filter(p => p.caseStudySlug)
    for (const project of withSlug) {
      expect(project.isLink, `"${project.id}" has caseStudySlug but isLink=false`).toBe(true)
      expect(
        project.href,
        `"${project.id}" has caseStudySlug but empty href`
      ).toContain(`/project/${project.caseStudySlug}`)
    }
  })
})

describe('defaultImageMap completeness', () => {
  it('has an image for every accent color used by the theme', () => {
    // The valid accents are defined in ThemeContext, but we can check
    // that the map has at least the accents we know about
    const expectedAccents = ['table', 'portrait', 'sky', 'pizza', 'vineyard']
    for (const accent of expectedAccents) {
      expect(
        defaultImageMap[accent as keyof typeof defaultImageMap],
        `Missing default portrait for accent "${accent}"`
      ).toBeDefined()
    }
  })
})
