export function formatArea(m2: number): string {
  if (m2 >= 100) {
    return `${Math.round(m2)} m²`
  }
  return `${m2.toFixed(1)} m²`
}

export function formatMeters(m: number): string {
  return Number.isInteger(m) ? `${m}` : m.toFixed(1)
}
