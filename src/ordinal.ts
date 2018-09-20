export const ordinal = (n: number): string => {
  const indicator = () => {
    const cent = n % 100
    if (cent >= 10 && cent <= 20) return 'th'
    const dec = n % 10
    return dec === 1 ? 'st' : dec === 2 ? 'nd' : dec === 3 ? 'rd' : 'th'
  }

  return `${n}${indicator()}`
}
