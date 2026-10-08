import type { Point, Rect } from '../../types'
import { clamp } from '../geometry'

export function clampPointToRect(point: Point, rect: Rect, margin = 0): Point {
  return {
    x: clamp(point.x, rect.x + margin, rect.x + rect.width - margin),
    y: clamp(point.y, rect.y + margin, rect.y + rect.height - margin),
  }
}

export function clampRoomToRect(
  room: { x: number; y: number; width: number; height: number },
  rect: Rect,
): { x: number; y: number; width: number; height: number } {
  const width = Math.min(room.width, rect.width)
  const height = Math.min(room.height, rect.height)
  return {
    x: clamp(room.x, rect.x, rect.x + rect.width - width),
    y: clamp(room.y, rect.y, rect.y + rect.height - height),
    width,
    height,
  }
}
