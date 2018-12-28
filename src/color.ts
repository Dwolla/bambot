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

export const rndColor = (seed?: number): ((i: number) => string) => {
  const s = seed === undefined ? rnd(COLORS.length) : seed
  return (i: number) => COLORS[Math.abs(s + i) % COLORS.length]
}
