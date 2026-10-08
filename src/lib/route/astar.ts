import type { Floor, Point } from '../../types'
import {
  CELL,
  EPSILON,
  buildWalkGrid,
  fromCell,
  manhattan,
  nearestWalkCell,
  samePoint,
  snapToWalkable,
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

export function pathOnFloor(floor: Floor, start: Point, end: Point): Point[] {
  const rects = walkableRects(floor)
  const startSnap = snapToWalkable(rects, start)
  const endSnap = snapToWalkable(rects, end)
  if (!startSnap || !endSnap) {
    return [start, end]
  }

  const grid = buildWalkGrid(rects)
  if (!grid) {
    return [startSnap, endSnap]
  }

  const startCell = nearestWalkCell(grid, startSnap)
  const endCell = nearestWalkCell(grid, endSnap)
  if (!startCell || !endCell) {
    return [startSnap, endSnap]
  }

  const cells = astarOrtho(grid, startCell, endCell)
  if (!cells || cells.length === 0) {
    return [startSnap, endSnap]
  }

  return simplifyOrthogonal([startSnap, ...cells, endSnap])
}
