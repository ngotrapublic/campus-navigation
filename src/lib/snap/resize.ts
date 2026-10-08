import type { Rect } from '../../types'
import { collectSnapTargets, nearest } from './collect'
import type { SnapBox, SnapGuide } from './types'
import { snapBoxMove } from './move'

const DEFAULT_THRESHOLD = 10

export function snapBoxResize(
  box: SnapBox,
  handle: string,
  others: SnapBox[],
  bounds: Rect,
  threshold = DEFAULT_THRESHOLD,
): { box: SnapBox; guides: SnapGuide[] } {
  const targets = collectSnapTargets(others, box.id, bounds)
  const guides: SnapGuide[] = []
  let { x, y, width, height } = box
  const right = x + width
  const bottom = y + height

  if (handle.includes('e')) {
    const edge = nearest(right, targets.xs, threshold)
    const matchedWidth = nearest(width, targets.widths, threshold)
    if (edge !== null) {
      width = Math.max(28, edge - x)
      guides.push({ orientation: 'v', position: edge })
    } else if (matchedWidth !== null) {
      width = matchedWidth
      guides.push({ orientation: 'v', position: x + width })
    }
  }

  if (handle.includes('w')) {
    const edge = nearest(x, targets.xs, threshold)
    const matchedWidth = nearest(width, targets.widths, threshold)
    if (edge !== null) {
      const nextRight = right
      x = edge
      width = Math.max(28, nextRight - x)
      guides.push({ orientation: 'v', position: edge })
    } else if (matchedWidth !== null) {
      x = right - matchedWidth
      width = matchedWidth
      guides.push({ orientation: 'v', position: x })
    }
  }

  if (handle.includes('s')) {
    const edge = nearest(bottom, targets.ys, threshold)
    const matchedHeight = nearest(height, targets.heights, threshold)
    if (edge !== null) {
      height = Math.max(28, edge - y)
      guides.push({ orientation: 'h', position: edge })
    } else if (matchedHeight !== null) {
      height = matchedHeight
      guides.push({ orientation: 'h', position: y + height })
    }
  }

  if (handle.includes('n')) {
    const edge = nearest(y, targets.ys, threshold)
    const matchedHeight = nearest(height, targets.heights, threshold)
    if (edge !== null) {
      const nextBottom = bottom
      y = edge
      height = Math.max(28, nextBottom - y)
      guides.push({ orientation: 'h', position: edge })
    } else if (matchedHeight !== null) {
      y = bottom - matchedHeight
      height = matchedHeight
      guides.push({ orientation: 'h', position: y })
    }
  }

  return {
    box: { ...box, x, y, width, height },
    guides,
  }
}

export const snapRoomMove = snapBoxMove
export const snapRoomResize = snapBoxResize
