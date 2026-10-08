import type { Floor, Point } from '../../types'

export type WalkRect = {
  x: number
  y: number
  width: number
  height: number
}

export const CELL = 8
export const EPSILON = 0.5

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function samePoint(a: Point, b: Point, eps = EPSILON): boolean {
  return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps
}

export function walkableRects(floor: Floor): WalkRect[] {
  const passages = floor.passages ?? []
  const opens = floor.rooms
    .filter((room) => room.kind === 'open')
    .map((room) => ({
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
    }))
  return [...passages, ...opens]
}

function pointInRect(point: Point, rect: WalkRect, pad = 0): boolean {
  return (
    point.x >= rect.x - pad &&
    point.x <= rect.x + rect.width + pad &&
    point.y >= rect.y - pad &&
    point.y <= rect.y + rect.height + pad
  )
}

function clampToRect(rect: WalkRect, point: Point): Point {
  return {
    x: Math.min(rect.x + rect.width, Math.max(rect.x, point.x)),
    y: Math.min(rect.y + rect.height, Math.max(rect.y, point.y)),
  }
}

export function snapToWalkable(rects: WalkRect[], point: Point): Point | null {
  if (rects.length === 0) {
    return null
  }
  for (const rect of rects) {
    if (pointInRect(point, rect, 1)) {
      return clampToRect(rect, point)
    }
  }
  let best: Point | null = null
  let bestDist = Infinity
  for (const rect of rects) {
    const clamped = clampToRect(rect, point)
    const d = dist(point, clamped)
    if (d < bestDist) {
      bestDist = d
      best = clamped
    }
  }
  return best
}

function boundsOf(rects: WalkRect[]): WalkRect | null {
  if (rects.length === 0) {
    return null
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const rect of rects) {
    minX = Math.min(minX, rect.x)
    minY = Math.min(minY, rect.y)
    maxX = Math.max(maxX, rect.x + rect.width)
    maxY = Math.max(maxY, rect.y + rect.height)
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function buildWalkGrid(rects: WalkRect[]) {
  const bounds = boundsOf(rects)
  if (!bounds) {
    return null
  }
  const cols = Math.max(1, Math.ceil(bounds.width / CELL) + 1)
  const rows = Math.max(1, Math.ceil(bounds.height / CELL) + 1)
  const walk = new Uint8Array(cols * rows)
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const point = {
        x: bounds.x + col * CELL + CELL / 2,
        y: bounds.y + row * CELL + CELL / 2,
      }
      if (rects.some((rect) => pointInRect(point, rect, 0.5))) {
        walk[row * cols + col] = 1
      }
    }
  }
  return { bounds, cols, rows, walk }
}

export type WalkGrid = NonNullable<ReturnType<typeof buildWalkGrid>>

export function toCell(grid: WalkGrid, point: Point): { col: number; row: number } {
  return {
    col: Math.max(
      0,
      Math.min(grid.cols - 1, Math.round((point.x - grid.bounds.x) / CELL)),
    ),
    row: Math.max(
      0,
      Math.min(grid.rows - 1, Math.round((point.y - grid.bounds.y) / CELL)),
    ),
  }
}

export function fromCell(grid: WalkGrid, col: number, row: number): Point {
  return {
    x: grid.bounds.x + col * CELL + CELL / 2,
    y: grid.bounds.y + row * CELL + CELL / 2,
  }
}

export function nearestWalkCell(
  grid: WalkGrid,
  point: Point,
): { col: number; row: number } | null {
  const start = toCell(grid, point)
  if (grid.walk[start.row * grid.cols + start.col]) {
    return start
  }
  let best: { col: number; row: number } | null = null
  let bestDist = Infinity
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (!grid.walk[row * grid.cols + col]) {
        continue
      }
      const d = Math.abs(col - start.col) + Math.abs(row - start.row)
      if (d < bestDist) {
        bestDist = d
        best = { col, row }
      }
    }
  }
  return best
}
