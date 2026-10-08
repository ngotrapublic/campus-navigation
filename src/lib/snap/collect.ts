import type { Rect } from '../../types'
import type { SnapBox } from './types'

export function nearest(
  value: number,
  targets: number[],
  threshold: number,
): number | null {
  let best: number | null = null
  let bestDist = threshold
  for (const target of targets) {
    const dist = Math.abs(value - target)
    if (dist <= bestDist) {
      best = target
      bestDist = dist
    }
  }
  return best
}

export function collectSnapTargets(
  boxes: SnapBox[],
  excludeId: string | undefined,
  bounds: Rect,
): { xs: number[]; ys: number[]; widths: number[]; heights: number[] } {
  const xs = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width]
  const ys = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height]
  const widths: number[] = []
  const heights: number[] = []

  for (const box of boxes) {
    if (excludeId && box.id === excludeId) {
      continue
    }
    xs.push(box.x, box.x + box.width / 2, box.x + box.width)
    ys.push(box.y, box.y + box.height / 2, box.y + box.height)
    widths.push(box.width)
    heights.push(box.height)
  }

  return { xs, ys, widths, heights }
}

export type AxisCandidate = {
  dist: number
  guide: number
  apply: () => void
}

export function bestCandidate(candidates: AxisCandidate[]): AxisCandidate | null {
  let best: AxisCandidate | null = null
  for (const candidate of candidates) {
    if (!best || candidate.dist < best.dist) {
      best = candidate
    }
  }
  return best
}
