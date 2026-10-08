import type { Passage } from '../types'

export function normalizePassage(
  raw: Partial<Passage> & { id: string },
): Passage {
  return {
    id: raw.id,
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    width: Math.max(16, raw.width ?? 80),
    height: Math.max(16, raw.height ?? 40),
  }
}
