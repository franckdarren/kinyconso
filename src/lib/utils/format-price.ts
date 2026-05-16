const formatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return `${formatter.format(amount)} FCFA`
}

export function parsePrice(input: string): number {
  const cleaned = input.replace(/[^\d]/g, '')
  return cleaned ? Number.parseInt(cleaned, 10) : 0
}
