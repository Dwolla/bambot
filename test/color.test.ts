import { color } from '../src/color'

test('color', () => {
  expect(color(0, 0)).toBe('#9400D3')
  expect(color(1, 0)).toBe('#4B0082')
  expect(color(2, 0)).toBe('#0000FF')
  expect(color(3, 0)).toBe('#00FF00')
  expect(color(4, 0)).toBe('#FFFF00')
  expect(color(5, 0)).toBe('#FF7F00')
  expect(color(6, 0)).toBe('#FF0000')
})

test('out of range', () => {
  expect(color(7, 0)).toBe('#9400D3')
  expect(color(-1, 0)).toBe('#4B0082')
})
