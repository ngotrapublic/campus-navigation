import type { Rect } from '../../types'
import {
  bestCandidate,
  collectSnapTargets,
  type AxisCandidate,
} from './collect'
import type { SnapBox, SnapGuide } from './types'

const DEFAULT_THRESHOLD = 10

export function snapBoxMove(
  box: SnapBox,
  others: SnapBox[],
  bounds: Rect,
  threshold = DEFAULT_THRESHOLD,
): { box: SnapBox; guides: SnapGuide[] } {
  const targets = collectSnapTargets(others, box.id, bounds)
  const guides: SnapGuide[] = []
  let { x, y } = box

  const xCandidates: AxisCandidate[] = []
  for (const target of targets.xs) {
    const leftDist = Math.abs(x - target)
    if (leftDist <= threshold) {
      xCandidates.push({
        dist: leftDist,
        guide: target,
        apply: () => {
          x = target
        },
      })
    }
    const midDist = Math.abs(x + box.width / 2 - target)
    if (midDist <= threshold) {
      xCandidates.push({
        dist: midDist,
        guide: target,
        apply: () => {
          x = target - box.width / 2
        },
      })
    }
    const rightDist = Math.abs(x + box.width - target)
    if (rightDist <= threshold) {
      xCandidates.push({
        dist: rightDist,
        guide: target,
        apply: () => {
          x = target - box.width
        },
      })
    }
  }

  const bestX = bestCandidate(xCandidates)
  if (bestX) {
    bestX.apply()
    guides.push({ orientation: 'v', position: bestX.guide })
  }

  const yCandidates: AxisCandidate[] = []
  for (const target of targets.ys) {
    const topDist = Math.abs(y - target)
    if (topDist <= threshold) {
      yCandidates.push({
        dist: topDist,
        guide: target,
        apply: () => {
          y = target
        },
      })
    }
    const midDist = Math.abs(y + box.height / 2 - target)
    if (midDist <= threshold) {
      yCandidates.push({
        dist: midDist,
        guide: target,
        apply: () => {
          y = target - box.height / 2
        },
      })
    }
    const bottomDist = Math.abs(y + box.height - target)
    if (bottomDist <= threshold) {
      yCandidates.push({
        dist: bottomDist,
        guide: target,
        apply: () => {
          y = target - box.height
        },
      })
    }
  }

  const bestY = bestCandidate(yCandidates)
  if (bestY) {
    bestY.apply()
    guides.push({ orientation: 'h', position: bestY.guide })
  }

  return {
    box: { ...box, x, y },
    guides,
  }
}
