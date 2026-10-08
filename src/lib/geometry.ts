import type { Point, Rect } from '../types'

export function createMildUCorridor(bounds?: Rect): Point[] {
  const left = bounds ? bounds.x + bounds.width * 0.12 : 180
  const right = bounds
    ? bounds.x + bounds.width * 0.88
    : 1200 - 180
  const top = bounds ? bounds.y + bounds.height * 0.18 : 160
  const bottom = bounds
    ? bounds.y + bounds.height * 0.82
    : 800 - 180
  const midY = (top + bottom) / 2
  const span = right - left

  return [
    { x: left, y: top },
    { x: left, y: midY + span * 0.04 },
    { x: left + span * 0.08, y: bottom - span * 0.04 },
    { x: left + span * 0.2, y: bottom },
    { x: (left + right) / 2, y: bottom + span * 0.02 },
    { x: right - span * 0.2, y: bottom },
    { x: right - span * 0.08, y: bottom - span * 0.04 },
    { x: right, y: midY + span * 0.04 },
    { x: right, y: top },
  ]
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
