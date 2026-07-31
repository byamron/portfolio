/**
 * Specimen compositions.
 *
 * Each round sets one of these entirely in the mystery face, at three sizes.
 * Seeing a face at display, deck and reading size is how designers actually
 * recognise type: the big line shows terminals, counters and joins, while the
 * paragraph shows colour, rhythm and how the face behaves in bulk. A single
 * word at one size hides more than half the evidence.
 *
 * The copy is deliberately about anything other than typography. Text that
 * discusses type would both hint at the answer and read as self-satisfied.
 * Headings are chosen to exercise the letterforms that most distinguish a face:
 * a two-storey a and g, a leg on the R, the shoulder of an h, an ampersand.
 */

export type Composition = {
  heading: string
  deck: string
  body: string
}

export const COMPOSITIONS: Composition[] = [
  {
    heading: 'Migrations',
    deck: 'The Arctic tern flies eighty thousand kilometres each year, chasing an endless summer.',
    body: 'It leaves Greenland in August and arrives in Antarctica ten weeks later, having crossed the whole width of the Atlantic on a route that no map records and no bird is taught. Ringed individuals have been found alive at thirty. Over a lifetime one tern covers the distance to the moon and most of the way back again.',
  },
  {
    heading: 'Quiet & Loud',
    deck: 'A concert hall is a machine for making one instrument sound like forty.',
    body: 'Reverberation time is the interval a sound needs to fade to a millionth of its original power. Two seconds flatters an orchestra; half a second suits a lecture and makes music sound thin and abrupt. Architects spend years tuning plaster, timber and air to land within a tenth of a second of the figure they want.',
  },
  {
    heading: 'The Long Night',
    deck: 'For six weeks each winter the sun does not rise above the horizon in Tromsø.',
    body: 'What arrives instead is a slow blue hour that lasts all day, thin light reflected off snow and low cloud, bright enough to read by around noon and gone by two. Residents describe it not as darkness but as a particular quality of colour that photographs refuse to capture honestly.',
  },
  {
    heading: 'Bright Objects',
    deck: 'Every element heavier than iron was forged in the collapse of a dying star.',
    body: 'The gold in a wedding ring was assembled in a few violent seconds, either in a supernova or in the collision of two neutron stars, then scattered across a region of space wide enough to swallow a thousand solar systems. It drifted for billions of years before the Earth condensed around it.',
  },
  {
    heading: 'Grammar of Rain',
    deck: 'Scots has more than four hundred recorded words for weather.',
    body: 'A smirr is rain so fine it seems to hang rather than fall. To dreich a day is to make it grey, wet and dispiriting all at once. Plowetery describes the specific misery of a downpour on a road already flooded. The vocabulary is not decorative; it is the residue of paying close attention for a very long time.',
  },
  {
    heading: 'Salvage',
    deck: 'The deepest shipwreck ever surveyed lies six and a half kilometres down.',
    body: 'At that depth the water is a little above freezing, entirely without light, and pressing in at more than six hundred times the weight of the atmosphere. Wood is long gone, eaten by molluscs. Steel survives, slowly consumed by bacteria that hang from the hull in rust-coloured filaments the crew named rusticles.',
  },
  {
    heading: 'Regarding Bees',
    deck: 'A returning forager describes distance and direction by dancing in the dark.',
    body: 'The waggle run points at the food source relative to the sun, and its duration encodes the flight. Roughly one second stands for a kilometre. Because the sun moves, a bee kept waiting in the hive will silently rotate the angle of her dance to correct for the delay, without ever seeing the sky.',
  },
  {
    heading: 'Cartography',
    deck: 'No flat map can preserve both shape and area; every projection is an argument.',
    body: 'Mercator keeps angles true, which is why it guided ships for four centuries, and inflates Greenland to the apparent size of Africa as the price. Peters preserves area and stretches the tropics into ribbons. There is no neutral choice available, only a decision about which distortion you are prepared to defend.',
  },
  {
    heading: 'Standing Stones',
    deck: 'The builders at Callanish worked for generations on a structure none would see finished.',
    body: 'The tallest stone weighs about seven tonnes and was dragged from a quarry some distance away, raised by people with rope, timber and an unusually long view of time. Peat later buried the circle to a depth of five feet, where it sat forgotten until a landowner had it cleared in 1857.',
  },
  {
    heading: 'A Question of Salt',
    deck: 'The Dead Sea is nine times saltier than the ocean and getting saltier.',
    body: 'Nothing larger than a bacterium lives in it. The surface sits four hundred and thirty metres below sea level, the lowest exposed land on the planet, and it drops by roughly a metre every year as the Jordan is drawn off upstream. The retreating shoreline leaves sinkholes that open without warning.',
  },
  {
    heading: 'Night Shift',
    deck: 'Half the species on Earth do their living after dark.',
    body: 'Moths navigate by holding a fixed angle to the moon, a strategy that works flawlessly until a porch light offers a nearer and much closer body to steer by, at which point the constant angle becomes a spiral. What looks like attraction to the flame is really a navigation system being asked an impossible question.',
  },
  {
    heading: 'Weights & Measures',
    deck: 'For 130 years the kilogram was a lump of metal in a vault outside Paris.',
    body: 'Forty official copies were distributed worldwide and compared periodically against the original. They drifted, by tens of micrograms, and nobody could say whether the copies were gaining or the prototype was losing. In 2019 the definition was finally cut loose from the object and fixed to the Planck constant instead.',
  },
]

/** Deterministic pick so a given daily always shows the same composition. */
export function compositionFor(seed: number): Composition {
  // Floored modulo. `dayNumber` is computed from a *local* date against a UTC
  // epoch, so a clock even slightly behind launch day yields a negative seed —
  // and a negative index returns undefined, which throws in initialBlocks and
  // white-screens the app with no error boundary to catch it.
  const n = COMPOSITIONS.length
  return COMPOSITIONS[((seed % n) + n) % n]
}
