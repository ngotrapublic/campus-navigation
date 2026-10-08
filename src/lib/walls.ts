import type { Wall } from '../types'

type LegacyWall = Partial<Wall> & {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  widthM?: number
  width?: number
}

export function normalizeWall(raw: LegacyWall): Wall {
  if (
    typeof raw.x === 'number' &&
    typeof raw.y === 'number' &&
    typeof raw.width === 'number' &&
    typeof raw.height === 'number' &&
    raw.width > 0 &&
    raw.height > 0 &&
    raw.x1 === undefined
  ) {
    return {
      id: raw.id,
      x: raw.x,
      y: raw.y,
      width: raw.width,
      height: raw.height,
    }
  }

  if (
    typeof raw.x1 === 'number' &&
    typeof raw.y1 === 'number' &&
    typeof raw.x2 === 'number' &&
    typeof raw.y2 === 'number'
  ) {
    const thickness =
      typeof raw.widthM === 'number'
        ? Math.max(8, raw.widthM * 40)
        : typeof raw.width === 'number' && raw.width > 1.5
          ? raw.width
          : 8
    const dx = raw.x2 - raw.x1
    const dy = raw.y2 - raw.y1
    if (Math.abs(dx) >= Math.abs(dy)) {
      return {
        id: raw.id,
        x: Math.min(raw.x1, raw.x2),
        y: (raw.y1 + raw.y2) / 2 - thickness / 2,
        width: Math.max(28, Math.abs(dx)),
        height: thickness,
      }
    }
    return {
      id: raw.id,
      x: (raw.x1 + raw.x2) / 2 - thickness / 2,
      y: Math.min(raw.y1, raw.y2),
      width: thickness,
      height: Math.max(28, Math.abs(dy)),
    }
  }

  return {
    id: raw.id,
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    width: Math.max(28, raw.width ?? 80),
    height: Math.max(8, raw.height ?? 12),
  }
}
