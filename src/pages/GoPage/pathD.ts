import type { Point } from '../../types'

export function pathD(points: Point[]): string {
  if (points.length === 0) {
    return ''
  }
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}
