import type { DoorSide, Point, Rect } from '../../types'

export type SymmetryAxis = 'vertical' | 'horizontal'

export function mirrorDoorSide(
  side: DoorSide | null | undefined,
  axis: SymmetryAxis,
): DoorSide | null {
  if (!side) {
    return null
  }
  if (axis === 'vertical') {
    if (side === 'e') {
      return 'w'
    }
    if (side === 'w') {
      return 'e'
    }
    return side
  }
  if (side === 'n') {
    return 's'
  }
  if (side === 's') {
    return 'n'
  }
  return side
}

export function buildingCenter(bounds: Rect): { cx: number; cy: number } {
  return {
    cx: bounds.x + bounds.width / 2,
    cy: bounds.y + bounds.height / 2,
  }
}

export function mirrorBox(
  box: { x: number; y: number; width: number; height: number },
  axis: SymmetryAxis,
  cx: number,
  cy: number,
) {
  if (axis === 'vertical') {
    return {
      ...box,
      x: 2 * cx - (box.x + box.width),
      y: box.y,
    }
  }
  return {
    ...box,
    x: box.x,
    y: 2 * cy - (box.y + box.height),
  }
}

export function mirrorPoint(
  point: Point,
  axis: SymmetryAxis,
  cx: number,
  cy: number,
): Point {
  if (axis === 'vertical') {
    return { x: 2 * cx - point.x, y: point.y }
  }
  return { x: point.x, y: 2 * cy - point.y }
}

export function isOnSourceSide(
  centerX: number,
  centerY: number,
  axis: SymmetryAxis,
  cx: number,
  cy: number,
  epsilon = 2,
): boolean {
  if (axis === 'vertical') {
    return centerX < cx - epsilon
  }
  return centerY < cy - epsilon
}

export function nearBox(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  threshold = 6,
): boolean {
  return (
    Math.abs(a.x - b.x) < threshold &&
    Math.abs(a.y - b.y) < threshold &&
    Math.abs(a.width - b.width) < threshold &&
    Math.abs(a.height - b.height) < threshold
  )
}
