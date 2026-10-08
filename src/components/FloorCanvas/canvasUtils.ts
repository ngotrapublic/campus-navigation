import type { Point, Rect } from '../../types'
import { clamp } from '../../lib/geometry'
import type { ResizeHandle, YardCue } from './types'
import type { YardDirection } from '../../lib/site'

export const MIN_ROOM = 28
export const HANDLE_SIZE = 10

export function resizeRoomRect(
  origin: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  point: Point,
): { x: number; y: number; width: number; height: number } {
  let { x, y, width, height } = origin
  const right = origin.x + origin.width
  const bottom = origin.y + origin.height

  if (handle.includes('e')) {
    width = Math.max(MIN_ROOM, point.x - origin.x)
  }
  if (handle.includes('s')) {
    height = Math.max(MIN_ROOM, point.y - origin.y)
  }
  if (handle.includes('w')) {
    const nextX = Math.min(point.x, right - MIN_ROOM)
    width = right - nextX
    x = nextX
  }
  if (handle.includes('n')) {
    const nextY = Math.min(point.y, bottom - MIN_ROOM)
    height = bottom - nextY
    y = nextY
  }

  return { x, y, width, height }
}

export function handleCursor(handle: ResizeHandle): string {
  if (handle === 'n' || handle === 's') return 'ns-resize'
  if (handle === 'e' || handle === 'w') return 'ew-resize'
  if (handle === 'ne' || handle === 'sw') return 'nesw-resize'
  return 'nwse-resize'
}

export function svgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  view: Rect,
): Point {
  const ctm = svg.getScreenCTM()
  if (!ctm) {
    const rect = svg.getBoundingClientRect()
    return {
      x: clamp(
        view.x + ((clientX - rect.left) / rect.width) * view.width,
        view.x,
        view.x + view.width,
      ),
      y: clamp(
        view.y + ((clientY - rect.top) / rect.height) * view.height,
        view.y,
        view.y + view.height,
      ),
    }
  }

  const screen = new DOMPoint(clientX, clientY)
  const local = screen.matrixTransform(ctm.inverse())
  return {
    x: clamp(local.x, view.x, view.x + view.width),
    y: clamp(local.y, view.y, view.y + view.height),
  }
}

export function boxHandles(box: {
  x: number
  y: number
  width: number
  height: number
}): { id: ResizeHandle; cx: number; cy: number }[] {
  const { x, y, width, height } = box
  return [
    { id: 'nw', cx: x, cy: y },
    { id: 'n', cx: x + width / 2, cy: y },
    { id: 'ne', cx: x + width, cy: y },
    { id: 'e', cx: x + width, cy: y + height / 2 },
    { id: 'se', cx: x + width, cy: y + height },
    { id: 's', cx: x + width / 2, cy: y + height },
    { id: 'sw', cx: x, cy: y + height },
    { id: 'w', cx: x, cy: y + height / 2 },
  ]
}

export function centerBoxHandles(halfW: number, halfH: number) {
  return [
    { id: 'nw' as ResizeHandle, cx: -halfW, cy: -halfH },
    { id: 'n' as ResizeHandle, cx: 0, cy: -halfH },
    { id: 'ne' as ResizeHandle, cx: halfW, cy: -halfH },
    { id: 'e' as ResizeHandle, cx: halfW, cy: 0 },
    { id: 'se' as ResizeHandle, cx: halfW, cy: halfH },
    { id: 's' as ResizeHandle, cx: 0, cy: halfH },
    { id: 'sw' as ResizeHandle, cx: -halfW, cy: halfH },
    { id: 'w' as ResizeHandle, cx: -halfW, cy: 0 },
  ]
}

export function boxOrigin(item: { x: number; y: number; width: number; height: number }) {
  return { x: item.x, y: item.y, width: item.width, height: item.height }
}

export function yardCueFromSide(
  yardSide: YardDirection,
  building: Rect,
): YardCue {
  if (yardSide === 'top') {
    return {
      band: {
        x: building.x,
        y: building.y - 36,
        width: building.width,
        height: 28,
      },
      labelX: building.x + building.width / 2,
      labelY: building.y - 16,
      arrow: '↑',
    }
  }
  if (yardSide === 'bottom') {
    return {
      band: {
        x: building.x,
        y: building.y + building.height + 8,
        width: building.width,
        height: 28,
      },
      labelX: building.x + building.width / 2,
      labelY: building.y + building.height + 28,
      arrow: '↓',
    }
  }
  if (yardSide === 'left') {
    return {
      band: {
        x: building.x - 36,
        y: building.y,
        width: 28,
        height: building.height,
      },
      labelX: building.x - 22,
      labelY: building.y + building.height / 2,
      arrow: '←',
    }
  }
  return {
    band: {
      x: building.x + building.width + 8,
      y: building.y,
      width: 28,
      height: building.height,
    },
    labelX: building.x + building.width + 22,
    labelY: building.y + building.height / 2,
    arrow: '→',
  }
}
