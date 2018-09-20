const COLORS = [
  '#9400D3',
  '#4B0082',
  '#0000FF',
  '#00FF00',
  '#FFFF00',
  '#FF7F00',
  '#FF0000'
]

const rnd = (max: number, start: number = 0): number =>
  Math.floor(Math.random() * max + start)

const s = rnd(COLORS.length)
export const color = (i: number, seed: number = s): string =>
  COLORS[Math.abs(seed + i) % COLORS.length]
