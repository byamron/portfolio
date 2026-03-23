import { describe, it, expect } from 'vitest'
import { contribFill, formatDate, getTooltipText } from '@/components/ContributionHeatmap'

describe('contribFill', () => {
  it('returns an hsla() string', () => {
    const result = contribFill(5, 10, 34, 0.5, true)
    expect(result).toMatch(/^hsla\(/)
  })

  it('uses the provided hue', () => {
    const result = contribFill(5, 10, 204, 0, true)
    expect(result).toMatch(/^hsla\(204,/)
  })

  describe('empty cells (count = 0)', () => {
    it('dark mode: low saturation, low alpha', () => {
      const result = contribFill(0, 10, 34, 0.5, true)
      expect(result).toBe('hsla(34, 8%, 55%, 0.05)')
    })

    it('light mode: low saturation, low alpha', () => {
      const result = contribFill(0, 10, 34, 0.5, false)
      expect(result).toBe('hsla(34, 8%, 42.5%, 0.05)')
    })
  })

  describe('continuous intensity scaling', () => {
    it('sqrt scaling: count=4 of max=16 gives intensity 0.5', () => {
      // intensity = sqrt(4/16) = 0.5
      // alpha = 0.18 + 0.5 * 0.72 = 0.54
      // sat = 30 + 0.5 * 40 = 50
      const result = contribFill(4, 16, 34, 0, true)
      expect(result).toBe('hsla(34, 50%, 50%, 0.54)')
    })

    it('max count gives intensity 1.0', () => {
      // intensity = sqrt(10/10) = 1
      // alpha = 0.18 + 1 * 0.72 ≈ 0.9
      // sat = 30 + 1 * 40 = 70
      const result = contribFill(10, 10, 34, 0, true)
      expect(result).toMatch(/^hsla\(34, 70%, 50%, 0\.(?:9|89+9+)\)/)
    })

    it('low count gives low intensity', () => {
      // intensity = sqrt(1/100) = 0.1
      // alpha = 0.18 + 0.1 * 0.72 = 0.252
      // sat = 30 + 0.1 * 40 = 34
      const result = contribFill(1, 100, 34, 0, true)
      expect(result).toBe('hsla(34, 34%, 50%, 0.252)')
    })
  })

  describe('dark mode', () => {
    it('at t=0, lightness is 50', () => {
      const result = contribFill(5, 10, 34, 0, true)
      expect(result).toContain('50%')
    })

    it('at t=1, lightness is 60 (50 + 10)', () => {
      const result = contribFill(5, 10, 34, 1, true)
      expect(result).toContain('60%')
    })

    it('t increases saturation by 15 per unit', () => {
      // intensity = sqrt(10/10) = 1, sat = 70
      // t=0: sat = 70 + 0 = 70, t=1: sat = 70 + 15 = 85
      const r0 = contribFill(10, 10, 34, 0, true)
      const r1 = contribFill(10, 10, 34, 1, true)
      expect(r0).toContain('70%')
      expect(r1).toContain('85%')
    })
  })

  describe('light mode', () => {
    it('at t=0, lightness is 50', () => {
      const result = contribFill(5, 10, 34, 0, false)
      expect(result).toContain('50%')
    })

    it('at t=1, lightness is 35 (50 - 15)', () => {
      const result = contribFill(5, 10, 34, 1, false)
      expect(result).toContain('35%')
    })

    it('t increases saturation by 10 per unit', () => {
      // intensity = sqrt(10/10) = 1, sat = 70
      // t=0: sat = 70 + 0 = 70, t=1: sat = 70 + 10 = 80
      const r0 = contribFill(10, 10, 34, 0, false)
      const r1 = contribFill(10, 10, 34, 1, false)
      expect(r0).toContain('70%')
      expect(r1).toContain('80%')
    })
  })
})

describe('formatDate', () => {
  it('formats a date with "st" suffix', () => {
    expect(formatDate('2026-03-01')).toBe('March 1st')
  })

  it('formats a date with "nd" suffix', () => {
    expect(formatDate('2026-01-02')).toBe('January 2nd')
  })

  it('formats a date with "rd" suffix', () => {
    expect(formatDate('2026-06-03')).toBe('June 3rd')
  })

  it('formats a date with "th" suffix', () => {
    expect(formatDate('2026-07-15')).toBe('July 15th')
  })

  it('uses "th" for 11th, 12th, 13th (exceptions)', () => {
    expect(formatDate('2026-01-11')).toBe('January 11th')
    expect(formatDate('2026-01-12')).toBe('January 12th')
    expect(formatDate('2026-01-13')).toBe('January 13th')
  })

  it('uses "st" for 21st, "nd" for 22nd, "rd" for 23rd', () => {
    expect(formatDate('2026-01-21')).toBe('January 21st')
    expect(formatDate('2026-01-22')).toBe('January 22nd')
    expect(formatDate('2026-01-23')).toBe('January 23rd')
  })
})

describe('getTooltipText', () => {
  it('returns "yet" message for future dates', () => {
    expect(getTooltipText('2099-12-31', 0)).toBe('No contributions (yet)')
  })

  it('pluralizes "contributions" for count > 1', () => {
    const result = getTooltipText('2020-01-15', 5)
    expect(result).toBe('5 contributions on January 15th')
  })

  it('uses singular "contribution" for count = 1', () => {
    const result = getTooltipText('2020-01-15', 1)
    expect(result).toBe('1 contribution on January 15th')
  })

  it('shows 0 contributions for past dates with zero count', () => {
    const result = getTooltipText('2020-01-15', 0)
    expect(result).toBe('0 contributions on January 15th')
  })
})
