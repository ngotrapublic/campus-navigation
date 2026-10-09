import type { Floor, Point, Room } from '../../types'

export type WalkRect = {
  x: number
  y: number
  width: number
  height: number
}

export const CELL = 8
export const CLEARANCE = 14
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

export function expandRect(rect: WalkRect, margin: number): WalkRect {
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    width: rect.width + margin * 2,
    height: rect.height + margin * 2,
  }
}

export function insetRect(rect: WalkRect, margin: number): WalkRect | null {
  const width = rect.width - margin * 2
  const height = rect.height - margin * 2
  if (width < CELL || height < CELL) {
    return null
  }
  return {
    x: rect.x + margin,
    y: rect.y + margin,
    width,
    height,
  }
}

function roomToWalkRect(room: Room): WalkRect {
  return {
    x: room.x,
    y: room.y,
    width: room.width,
    height: room.height,
  }
}

export function walkableRects(
  floor: Floor,
  passThroughRooms: Room[] = [],
): WalkRect[] {
  const passages = floor.passages ?? []
  const opens = floor.rooms
    .filter((room) => room.kind === 'open')
    .map(roomToWalkRect)
  const passThrough = passThroughRooms
    .filter((room) => room.kind !== 'open')
    .map(roomToWalkRect)
  return [...passages, ...opens, ...passThrough]
}

export function preferredWalkRects(
  floor: Floor,
  clearance = CLEARANCE,
  passThroughRooms: Room[] = [],
): WalkRect[] {
  const base = walkableRects(floor)
  const inset = base
    .map((rect) => insetRect(rect, clearance))
    .filter((rect): rect is WalkRect => rect !== null)
  const preferredBase =
    inset.length > 0
      ? inset
      : base
          .map((rect) => insetRect(rect, Math.max(4, Math.floor(clearance / 2))))
          .filter((rect): rect is WalkRect => rect !== null)
  const passThrough = passThroughRooms.map(roomToWalkRect)
  const merged = [...(preferredBase.length > 0 ? preferredBase : base), ...passThrough]
  return merged.length > 0 ? merged : base
}

export function solidBlockRects(
  floor: Floor,
  passThroughRoomIds: Iterable<string> = [],
): WalkRect[] {
  const passThrough = new Set(passThroughRoomIds)
  const walls = floor.walls ?? []
  const rooms = floor.rooms
    .filter(
      (room) => room.kind !== 'open' && !passThrough.has(room.id),
    )
    .map(roomToWalkRect)
  return [...walls, ...rooms]
}

export function obstacleRects(
  floor: Floor,
  clearance = CLEARANCE,
): WalkRect[] {
  return solidBlockRects(floor).map((rect) => expandRect(rect, clearance))
}

export function pointInAny(point: Point, rects: WalkRect[], pad = 0): boolean {
  return rects.some((rect) => pointInRect(point, rect, pad))
}

export function axisSegmentOnWalkable(
  walkRects: WalkRect[],
  a: Point,
  b: Point,
  pad = 0.5,
): boolean {
  if (walkRects.length === 0) {
    return false
  }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.abs(dx) + Math.abs(dy)
  if (length < EPSILON) {
    return pointInAny(a, walkRects, pad)
  }
  const steps = Math.max(1, Math.ceil(length / (CELL / 2)))
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const point = { x: a.x + dx * t, y: a.y + dy * t }
    if (!pointInAny(point, walkRects, pad)) {
      return false
    }
  }
  return true
}

export function pointInRect(point: Point, rect: WalkRect, pad = 0): boolean {
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

export function approachPointForDoor(
  door: Point,
  side: Room['doorSide'] | null | undefined,
  clearance = CLEARANCE,
): Point {
  if (side === 'n') {
    return { x: door.x, y: door.y - clearance }
  }
  if (side === 'e') {
    return { x: door.x + clearance, y: door.y }
  }
  if (side === 's') {
    return { x: door.x, y: door.y + clearance }
  }
  if (side === 'w') {
    return { x: door.x - clearance, y: door.y }
  }
  return door
}

export function approachOnAxis(
  door: Point,
  side: Room['doorSide'] | null | undefined,
  walkRects: WalkRect[],
  fallbackRects: WalkRect[] = [],
  clearance = CLEARANCE,
): Point {
  if (!side) {
    return (
      snapToWalkable(walkRects, door) ??
      snapToWalkable(fallbackRects, door) ??
      door
    )
  }
  if (
    pointInAny(door, walkRects, 0.5) ||
    pointInAny(door, fallbackRects, 0.5)
  ) {
    const onDoor = approachPointForDoor(door, side, clearance)
    if (
      pointInAny(onDoor, walkRects, 0.5) ||
      pointInAny(onDoor, fallbackRects, 0.5)
    ) {
      return onDoor
    }
  }
  const step = CELL / 2
  const max = Math.max(clearance * 2, CELL * 4)
  const preferredSign =
    side === 'n' || side === 'w' ? -1 : 1
  const signs = [preferredSign, -preferredSign] as const
  let best: Point | null = null
  let bestDist = Infinity
  for (const sign of signs) {
    for (let along = step; along <= max + 0.01; along += step) {
      const point =
        side === 'n' || side === 's'
          ? { x: door.x, y: door.y + sign * along }
          : { x: door.x + sign * along, y: door.y }
      if (
        !pointInAny(point, walkRects, 0.5) &&
        !pointInAny(point, fallbackRects, 0.5)
      ) {
        continue
      }
      const d = dist(point, door)
      const bias = sign === preferredSign ? 0 : clearance
      if (d + bias < bestDist) {
        bestDist = d + bias
        best = point
      }
      if (sign === preferredSign && d >= clearance) {
        break
      }
    }
  }
  return best ?? approachPointForDoor(door, side, clearance)
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

export function buildWalkGrid(
  walkRects: WalkRect[],
  solids: WalkRect[] = [],
) {
  const bounds = boundsOf([...walkRects, ...solids])
  if (!bounds || walkRects.length === 0) {
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
      if (!pointInAny(point, walkRects, 0.5)) {
        continue
      }
      if (pointInAny(point, solids, 0)) {
        continue
      }
      walk[row * cols + col] = 1
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

export function axisSegmentOnWalk(
  grid: WalkGrid,
  a: Point,
  b: Point,
): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.abs(dx) >= EPSILON && Math.abs(dy) >= EPSILON) {
    return false
  }
  const length = Math.abs(dx) + Math.abs(dy)
  if (length < EPSILON) {
    const cell = toCell(grid, a)
    return Boolean(grid.walk[cell.row * grid.cols + cell.col])
  }
  const steps = Math.max(1, Math.ceil(length / (CELL / 2)))
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const point = { x: a.x + dx * t, y: a.y + dy * t }
    const cell = toCell(grid, point)
    if (!grid.walk[cell.row * grid.cols + cell.col]) {
      return false
    }
  }
  return true
}
