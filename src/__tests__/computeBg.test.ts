import { describe, it, expect } from 'vitest'
import { computeBg, type AccentColor, VALID_ACCENTS } from '@/contexts/ThemeContext'

/** Parse an HSL string like "hsl(200, 23.0%, 95.0%)" into [h, s, l] */
function parseHSL(hsl: string): [number, number, number] {
  const m = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/)
  if (!m) throw new Error(`Failed to parse HSL: ${hsl}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

describe('computeBg', () => {
  describe('returns valid HSL strings', () => {
    for (const accent of VALID_ACCENTS) {
      for (const mode of ['light', 'dark'] as const) {
        it(`${accent}/${mode} at t=0`, () => {
          const result = computeBg(accent, mode, 0)
          expect(result).toMatch(/^hsl\(\d+,\s*[\d.]+%,\s*[\d.]+%\)$/)
        })
      }
    }
  })

  describe('intensity scaling', () => {
    it('t=0 returns base saturation (multiplier 1.0)', () => {
      // sky dark base: [200, 22, 8]
      const [, s] = parseHSL(computeBg('sky', 'dark', 0))
      expect(s).toBeCloseTo(22, 0) // 22 * 1.0 = 22
    })

    it('t=1 returns max saturation (multiplier 2.8)', () => {
      // sky dark base: [200, 22, 8]
      const [, s] = parseHSL(computeBg('sky', 'dark', 1))
      expect(s).toBeCloseTo(22 * 2.8, 0) // 61.6
    })

    it('saturation is clamped to 100', () => {
      // pizza light base: [10, 30, 96]. At t=1: 30 * 2.8 = 84 (under 100)
      // portrait dark: [41, 14, 10]. At t=1: 14 * 2.8 = 39.2 (under 100)
      // All accents have base sat < 36, so 36 * 2.8 = 100.8 would clip
      // Verify no value exceeds 100
      for (const accent of VALID_ACCENTS) {
        for (const mode of ['light', 'dark'] as const) {
          const [, s] = parseHSL(computeBg(accent, mode, 1))
          expect(s).toBeLessThanOrEqual(100)
        }
      }
    })
  })

  describe('light mode lightness shift', () => {
    it('t=0 has no lightness shift', () => {
      // table light base: [30, 17, 91]
      const [, , l] = parseHSL(computeBg('table', 'light', 0))
      expect(l).toBeCloseTo(91, 0)
    })

    it('t=1 shifts lightness down by 10', () => {
      const [, , l] = parseHSL(computeBg('table', 'light', 1))
      expect(l).toBeCloseTo(81, 0) // 91 - 10
    })

    it('t=0.5 shifts lightness down by 5', () => {
      const [, , l] = parseHSL(computeBg('table', 'light', 0.5))
      expect(l).toBeCloseTo(86, 0) // 91 - 5
    })
  })

  describe('dark mode lightness shift', () => {
    it('t=0 has no lightness shift', () => {
      // sky dark base: [200, 22, 8]
      const [, , l] = parseHSL(computeBg('sky', 'dark', 0))
      expect(l).toBeCloseTo(8, 0)
    })

    it('t=1 shifts lightness up by 2', () => {
      const [, , l] = parseHSL(computeBg('sky', 'dark', 1))
      expect(l).toBeCloseTo(10, 0) // 8 + 2
    })
  })

  describe('hue preservation', () => {
    it('preserves hue at all intensity levels', () => {
      // sky base hue is 200
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const [h] = parseHSL(computeBg('sky', 'dark', t))
        expect(h).toBe(200)
      }
    })
  })

  describe('invalid accent fallback', () => {
    it('returns dark fallback for unknown accent in dark mode', () => {
      const result = computeBg('nonexistent' as AccentColor, 'dark', 0.5)
      expect(result).toBe('hsl(33, 18%, 12%)')
    })

    it('returns light fallback for unknown accent in light mode', () => {
      const result = computeBg('nonexistent' as AccentColor, 'light', 0.5)
      expect(result).toBe('hsl(30, 17%, 91%)')
    })
  })
})
