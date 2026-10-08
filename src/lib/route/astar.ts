import type { Floor, Point, Room } from '../../types'
import {
  CELL,
  CLEARANCE,
  EPSILON,
  approachPointForDoor,
  axisSegmentOnWalk,
  buildWalkGrid,
  fromCell,
  manhattan,
  nearestWalkCell,
  preferredWalkRects,
  samePoint,
  snapToWalkable,
  solidBlockRects,
  walkableRects,
  type WalkGrid,
} from './walkGrid'

export function astarOrtho(
  grid: WalkGrid,
  start: { col: number; row: number },
  goal: { col: number; row: number },
): Point[] | null {
  const key = (col: number, row: number) => row * grid.cols + col
  const startKey = key(start.col, start.row)
  const goalKey = key(goal.col, goal.row)
  if (!grid.walk[startKey] || !grid.walk[goalKey]) {
    return null
  }

  const open: number[] = [startKey]
  const came = new Map<number, number>()
  const gScore = new Map<number, number>([[startKey, 0]])
  const fScore = new Map<number, number>([
    [
      startKey,
      manhattan(fromCell(grid, start.col, start.row), fromCell(grid, goal.col, goal.row)),
    ],
  ])

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const

  while (open.length > 0) {
    let bestIndex = 0
    let bestF = Infinity
    for (let i = 0; i < open.length; i += 1) {
      const score = fScore.get(open[i]) ?? Infinity
      if (score < bestF) {
        bestF = score
        bestIndex = i
      }
    }
    const current = open.splice(bestIndex, 1)[0]
    if (current === goalKey) {
      const cells: Point[] = []
      let at: number | undefined = current
      while (at !== undefined) {
        const col = at % grid.cols
        const row = Math.floor(at / grid.cols)
        cells.push(fromCell(grid, col, row))
        at = came.get(at)
      }
      cells.reverse()
      return cells
    }

    const curCol = current % grid.cols
    const curRow = Math.floor(current / grid.cols)
    const currentG = gScore.get(current) ?? Infinity

    for (const [dx, dy] of dirs) {
      const nextCol = curCol + dx
      const nextRow = curRow + dy
      if (
        nextCol < 0 ||
        nextRow < 0 ||
        nextCol >= grid.cols ||
        nextRow >= grid.rows
      ) {
        continue
      }
      const nextKey = key(nextCol, nextRow)
      if (!grid.walk[nextKey]) {
        continue
      }
      const tentative = currentG + CELL
      if (tentative >= (gScore.get(nextKey) ?? Infinity)) {
        continue
      }
      came.set(nextKey, current)
      gScore.set(nextKey, tentative)
      fScore.set(
        nextKey,
        tentative +
          manhattan(
            fromCell(grid, nextCol, nextRow),
            fromCell(grid, goal.col, goal.row),
          ),
      )
      if (!open.includes(nextKey)) {
        open.push(nextKey)
      }
    }
  }

  return null
}

function axisAligned(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON || Math.abs(a.y - b.y) < EPSILON
}

function safeOrthoLink(grid: WalkGrid, a: Point, b: Point): Point[] | null {
  if (samePoint(a, b, 1)) {
    return [a]
  }
  if (axisAligned(a, b)) {
    return axisSegmentOnWalk(grid, a, b) ? [a, b] : null
  }
  const viaH = { x: b.x, y: a.y }
  const viaV = { x: a.x, y: b.y }
  const candidates =
    Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)
      ? [viaH, viaV]
      : [viaV, viaH]
  for (const corner of candidates) {
    if (
      axisSegmentOnWalk(grid, a, corner) &&
      axisSegmentOnWalk(grid, corner, b)
    ) {
      return [a, corner, b]
    }
  }
  const startCell = nearestWalkCell(grid, a)
  const endCell = nearestWalkCell(grid, b)
  if (!startCell || !endCell) {
    return null
  }
  const viaGrid = astarOrtho(grid, startCell, endCell)
  if (!viaGrid || viaGrid.length === 0) {
    return null
  }
  return viaGrid
}

export function simplifyOrthogonal(points: Point[]): Point[] {
  if (points.length <= 2) {
    return points
  }
  const result: Point[] = [points[0]]
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = result[result.length - 1]
    const cur = points[i]
    const next = points[i + 1]
    const colinear =
      (Math.abs(prev.x - cur.x) < EPSILON && Math.abs(cur.x - next.x) < EPSILON) ||
      (Math.abs(prev.y - cur.y) < EPSILON && Math.abs(cur.y - next.y) < EPSILON)
    if (!colinear) {
      result.push(cur)
    }
  }
  result.push(points[points.length - 1])
  const deduped: Point[] = []
  for (const point of result) {
    const prev = deduped[deduped.length - 1]
    if (!prev || !samePoint(prev, point, 1)) {
      deduped.push(point)
    }
  }
  return deduped
}

function stitchOnGrid(grid: WalkGrid, points: Point[]): Point[] {
  if (points.length === 0) {
    return []
  }
  const linked: Point[] = [points[0]]
  for (let i = 1; i < points.length; i += 1) {
    const segment = safeOrthoLink(grid, linked[linked.length - 1], points[i])
    if (!segment || segment.length === 0) {
      const cell = nearestWalkCell(grid, points[i])
      if (cell) {
        const via = astarOrtho(
          grid,
          nearestWalkCell(grid, linked[linked.length - 1]) ?? cell,
          cell,
        )
        if (via && via.length > 0) {
          linked.push(...via.slice(1))
        }
      }
      continue
    }
    linked.push(...segment.slice(1))
  }
  return simplifyOrthogonal(linked)
}

export type PathOnFloorOptions = {
  endRoom?: Room | null
  endDoor?: Point | null
  startDoor?: Point | null
  startDoorSide?: Room['doorSide']
  endDoorSide?: Room['doorSide']
}

function doorApproach(
  door: Point,
  side: Room['doorSide'] | null | undefined,
  preferred: ReturnType<typeof preferredWalkRects>,
  rawWalk: ReturnType<typeof walkableRects>,
): Point {
  const raw = approachPointForDoor(door, side, CLEARANCE)
  return (
    snapToWalkable(preferred, raw) ??
    snapToWalkable(rawWalk, raw) ??
    door
  )
}

function findGridPath(
  grid: WalkGrid,
  routeStart: Point,
  routeEnd: Point,
): Point[] | null {
  const startCell = nearestWalkCell(grid, routeStart)
  const endCell = nearestWalkCell(grid, routeEnd)
  if (!startCell || !endCell) {
    return null
  }
  const cells = astarOrtho(grid, startCell, endCell)
  if (!cells || cells.length === 0) {
    return null
  }
  return stitchOnGrid(grid, [routeStart, ...cells, routeEnd])
}

export function pathOnFloor(
  floor: Floor,
  start: Point,
  end: Point,
  options?: PathOnFloorOptions,
): Point[] {
  const preferred = preferredWalkRects(floor)
  const solids = solidBlockRects(floor)
  const rawWalk = walkableRects(floor)

  const startDoor = options?.startDoor ?? null
  const endDoor = options?.endDoor ?? null
  const endSide = options?.endDoorSide ?? options?.endRoom?.doorSide ?? null
  const startSide = options?.startDoorSide ?? null

  const routeStart = startDoor
    ? doorApproach(startDoor, startSide, preferred, rawWalk)
    : (snapToWalkable(preferred, start) ?? snapToWalkable(rawWalk, start))

  const routeEnd = endDoor
    ? doorApproach(endDoor, endSide, preferred, rawWalk)
    : (snapToWalkable(preferred, end) ?? snapToWalkable(rawWalk, end))

  if (!routeStart || !routeEnd) {
    return [start]
  }

  const preferredGrid = buildWalkGrid(preferred, solids)
  const fullGrid = buildWalkGrid(rawWalk, solids)
  const walked =
    (preferredGrid ? findGridPath(preferredGrid, routeStart, routeEnd) : null) ??
    (fullGrid ? findGridPath(fullGrid, routeStart, routeEnd) : null)

  if (!walked || walked.length === 0) {
    return [routeStart]
  }

  const points: Point[] = [...walked]

  if (startDoor && axisAligned(startDoor, routeStart)) {
    points.unshift(startDoor)
  }
  if (endDoor && axisAligned(routeEnd, endDoor)) {
    points.push(endDoor)
  }

  return simplifyOrthogonal(points)
}
