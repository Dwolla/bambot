import { rndColor } from "../src/color"

const color = rndColor(0)

test("color", () => {
  expect(color(0)).toBe("#9400D3")
  expect(color(1)).toBe("#4B0082")
  expect(color(2)).toBe("#0000FF")
  expect(color(3)).toBe("#00FF00")
  expect(color(4)).toBe("#FFFF00")
  expect(color(5)).toBe("#FF7F00")
  expect(color(6)).toBe("#FF0000")
})

test("out of range", () => {
  expect(color(7)).toBe("#9400D3")
  expect(color(-1)).toBe("#4B0082")
})
