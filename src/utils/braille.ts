/**
 * Braille unicode micro-animation utility.
 *
 * Braille characters (U+2800–U+28FF) encode 8 dots in a 4-row × 2-col grid.
 * Each dot maps to a bit:
 *
 *   Row 0: dot 1 (bit 0) | dot 4 (bit 4)
 *   Row 1: dot 2 (bit 1) | dot 5 (bit 5)
 *   Row 2: dot 3 (bit 2) | dot 6 (bit 6)
 *   Row 3: dot 7 (bit 3) | dot 8 (bit 7)
 */

export interface BrailleAnimation {
  readonly frames: readonly string[]
  readonly interval: number // ms between frames
}

const DOT_BITS = [
  [0, 4], // row 0
  [1, 5], // row 1
  [2, 6], // row 2
  [3, 7], // row 3
] as const

export function gridToBraille(grid: boolean[][]): string {
  let bits = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      if (grid[r]?.[c]) {
        const bit = DOT_BITS[r]?.[c]
        if (bit !== undefined) bits |= 1 << bit
      }
    }
  }
  return String.fromCharCode(0x2800 + bits)
}

// Directional sweep: dots travel left-to-right, echoing the → arrow's meaning.
// 6 frames × 50ms = 300ms total. Final empty frame = visual exhale before nav.
export const DIRECTIONAL_SWEEP: BrailleAnimation = {
  interval: 50,
  frames: [
    // Frame 0: left column fills
    gridToBraille([
      [true, false],
      [true, false],
      [true, false],
      [true, false],
    ]),
    // Frame 1: both columns, left dominant
    gridToBraille([
      [true, true],
      [true, false],
      [true, false],
      [true, true],
    ]),
    // Frame 2: full grid
    gridToBraille([
      [true, true],
      [true, true],
      [true, true],
      [true, true],
    ]),
    // Frame 3: right column dominant
    gridToBraille([
      [false, true],
      [true, true],
      [true, true],
      [false, true],
    ]),
    // Frame 4: right column only
    gridToBraille([
      [false, true],
      [false, true],
      [false, true],
      [false, true],
    ]),
    // Frame 5: empty — exhale before navigation
    gridToBraille([
      [false, false],
      [false, false],
      [false, false],
      [false, false],
    ]),
  ],
}
