import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sections, projectImageMap } from '@/data/projects'

const allProjects = sections.flatMap(s => s.projects)

describe('preload coverage', () => {
  it('projectImageMap does not include assets that are never displayed', () => {
    // Every projectId in the map should have at least one project that uses
    // it as a static image (not overridden by videoPreview or lottiePreview)
    for (const projectId of Object.keys(projectImageMap)) {
      const renderedBy = allProjects.filter(
        p => p.projectId === projectId && !p.videoPreview && !p.lottiePreview
      )
      expect(
        renderedBy.length,
        `"${projectId}" in projectImageMap is dead — overridden by video/lottie on all consumers`
      ).toBeGreaterThan(0)
    }
  })

  it('no static image in projectImageMap exceeds 1MB', async () => {
    // Large images in the preload path block other downloads.
    // If an image needs to be > 1MB, it should use videoPreview instead.
    // This test checks file sizes via the filesystem.
    const { existsSync, statSync } = await import('fs')
    const { resolve } = await import('path')
    const publicDir = resolve(__dirname, '../../public')

    for (const [projectId, src] of Object.entries(projectImageMap)) {
      const filePath = resolve(publicDir, src.replace(/^\//, ''))
      if (existsSync(filePath)) {
        const sizeBytes = statSync(filePath).size
        const sizeMB = sizeBytes / (1024 * 1024)
        expect(
          sizeMB,
          `projectImageMap["${projectId}"] → "${src}" is ${sizeMB.toFixed(1)}MB — too large for preload. Convert to video or compress.`
        ).toBeLessThan(1)
      }
    }
  })
})

describe('preload function behavior', () => {
  let imageSrcs: string[]

  beforeEach(() => {
    imageSrcs = []
    // Mock the Image constructor to capture what gets preloaded
    vi.stubGlobal('Image', class {
      _src = ''
      set src(val: string) {
        this._src = val
        imageSrcs.push(val)
      }
      get src() { return this._src }
    })
  })

  it('preloadPreviewImages skips .json and .mp4 files', async () => {
    // Reset module cache to get a fresh preloaded Set
    vi.resetModules()
    const { preloadPreviewImages } = await import('@/utils/preloadImages')
    preloadPreviewImages()

    for (const src of imageSrcs) {
      expect(src, `Preloaded a .json file: ${src}`).not.toMatch(/\.json$/)
      expect(src, `Preloaded a .mp4 file: ${src}`).not.toMatch(/\.mp4$/)
    }
  })

  it('preloadPreviewImages loads all static images from projectImageMap', async () => {
    vi.resetModules()
    const { preloadPreviewImages } = await import('@/utils/preloadImages')
    preloadPreviewImages()

    const staticImages = Object.values(projectImageMap).filter(
      src => !src.endsWith('.json') && !src.endsWith('.mp4')
    )
    for (const src of staticImages) {
      expect(imageSrcs, `Missing preload for "${src}"`).toContain(src)
    }
  })

  it('preloadPreviewImages does not double-load on second call', async () => {
    vi.resetModules()
    const { preloadPreviewImages } = await import('@/utils/preloadImages')
    preloadPreviewImages()
    const firstCount = imageSrcs.length
    preloadPreviewImages()
    expect(imageSrcs.length).toBe(firstCount)
  })
})
