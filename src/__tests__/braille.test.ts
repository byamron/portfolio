import { describe, it, expect } from 'vitest'
import { gridToBraille, DIRECTIONAL_SWEEP } from '@/utils/braille'

describe('gridToBraille', () => {
  it('returns blank braille for an empty grid', () => {
    const grid = [
      [false, false],
      [false, false],
      [false, false],
      [false, false],
    ]
    expect(gridToBraille(grid)).toBe('\u2800') // ⠀ (blank)
  })

  it('returns full braille for a filled grid', () => {
    const grid = [
      [true, true],
      [true, true],
      [true, true],
      [true, true],
    ]
    // All 8 bits set: 0xFF → U+28FF
    expect(gridToBraille(grid)).toBe('\u28FF')
  })

  it('encodes left column only (bits 0,1,2,3)', () => {
    const grid = [
      [true, false],
      [true, false],
      [true, false],
      [true, false],
    ]
    // bits: 0,1,2,3 → 0b00001111 = 15 → U+280F
    expect(gridToBraille(grid)).toBe('\u280F')
  })

  it('encodes right column only (bits 4,5,6,7)', () => {
    const grid = [
      [false, true],
      [false, true],
      [false, true],
      [false, true],
    ]
    // bits: 4,5,6,7 → 0b11110000 = 240 → U+28F0
    expect(gridToBraille(grid)).toBe('\u28F0')
  })

  it('encodes single top-left dot (bit 0)', () => {
    const grid = [
      [true, false],
      [false, false],
      [false, false],
      [false, false],
    ]
    expect(gridToBraille(grid)).toBe('\u2801')
  })

  it('handles sparse/missing rows gracefully', () => {
    // Grid shorter than 4 rows — should not crash
    const grid = [[true, false]]
    expect(gridToBraille(grid)).toBe('\u2801')
  })

  it('handles empty rows gracefully', () => {
    const grid: boolean[][] = [[], [], [], []]
    expect(gridToBraille(grid)).toBe('\u2800')
  })
})

describe('DIRECTIONAL_SWEEP', () => {
  it('has 6 frames', () => {
    expect(DIRECTIONAL_SWEEP.frames).toHaveLength(6)
  })

  it('has 50ms interval', () => {
    expect(DIRECTIONAL_SWEEP.interval).toBe(50)
  })

  it('starts with left column filled', () => {
    expect(DIRECTIONAL_SWEEP.frames[0]).toBe(gridToBraille([
      [true, false],
      [true, false],
      [true, false],
      [true, false],
    ]))
  })

  it('ends with an empty frame', () => {
    expect(DIRECTIONAL_SWEEP.frames[5]).toBe('\u2800')
  })

  it('reaches full grid at frame 2', () => {
    expect(DIRECTIONAL_SWEEP.frames[2]).toBe('\u28FF')
  })

  it('all frames are single unicode characters', () => {
    for (const frame of DIRECTIONAL_SWEEP.frames) {
      expect([...frame]).toHaveLength(1)
    }
  })
})
