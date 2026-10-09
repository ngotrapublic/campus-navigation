import type { Floor, Point, Room } from '../../types'
import {
  orthoInsideRoom,
  pointInRoom,
  roomContainingPoint,
  roomDoorPoint,
} from '../rooms'
import {
  CELL,
  CLEARANCE,
  EPSILON,
  approachOnAxis,
  axisSegmentOnWalk,
  buildWalkGrid,
  fromCell,
  manhattan,
  nearestWalkCell,
  pointInRect,
  preferredWalkRects,
  samePoint,
  snapToWalkable,
  solidBlockRects,
  walkableRects,
  type WalkGrid,
  type WalkRect,
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

function straightOrLOnWalk(
  grid: WalkGrid,
  a: Point,
  b: Point,
): Point[] | null {
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

export function ensureOrthogonal(points: Point[]): Point[] {
  if (points.length === 0) {
    return []
  }
  const linked: Point[] = [points[0]]
  for (let i = 1; i < points.length; i += 1) {
    const prev = linked[linked.length - 1]
    const cur = points[i]
    if (samePoint(prev, cur, 1)) {
      continue
    }
    if (axisAligned(prev, cur)) {
      linked.push(cur)
      continue
    }
    const viaH = { x: cur.x, y: prev.y }
    const viaV = { x: prev.x, y: cur.y }
    const corner =
      Math.abs(cur.x - prev.x) >= Math.abs(cur.y - prev.y) ? viaH : viaV
    linked.push(corner, cur)
  }
  return simplifyOrthogonal(linked)
}

function pullOrtho(grid: WalkGrid, points: Point[]): Point[] {
  if (points.length <= 2) {
    return points
  }
  const result: Point[] = [points[0]]
  let i = 0
  while (i < points.length - 1) {
    let best = i + 1
    for (let j = points.length - 1; j > i + 1; j -= 1) {
      if (straightOrLOnWalk(grid, points[i], points[j])) {
        best = j
        break
      }
    }
    const segment = straightOrLOnWalk(grid, points[i], points[best])
    if (segment && segment.length > 0) {
      result.push(...segment.slice(1))
    } else {
      result.push(points[best])
    }
    i = best
  }
  return simplifyOrthogonal(result)
}

export type PathOnFloorOptions = {
  startRoom?: Room | null
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
  return approachOnAxis(door, side, preferred, rawWalk, CLEARANCE)
}

function pathInSharedRect(
  rects: WalkRect[],
  from: Point,
  to: Point,
  pad = 4,
): Point[] | null {
  for (const rect of rects) {
    if (!pointInRect(from, rect, pad) || !pointInRect(to, rect, pad)) {
      continue
    }
    const viaH = { x: to.x, y: from.y }
    const viaV = { x: from.x, y: to.y }
    for (const path of [
      orthoInsideRoom(from, to),
      [from, viaV, to],
      [from, viaH, to],
    ]) {
      if (path.every((point) => pointInRect(point, rect, pad))) {
        return ensureOrthogonal(path)
      }
    }
  }
  return null
}

function pinDoorAxis(
  points: Point[],
  door: Point,
  side: Room['doorSide'] | null | undefined,
  fromStart: boolean,
): Point[] {
  if (!side || points.length === 0) {
    return points
  }
  const pinned = points.map((point) => ({ ...point }))
  const indices = fromStart
    ? pinned.map((_, index) => index)
    : pinned.map((_, index) => pinned.length - 1 - index)

  for (const index of indices) {
    const cur = pinned[index]
    if (side === 'e' || side === 'w') {
      if (Math.abs(cur.y - door.y) > CLEARANCE * 1.5) {
        break
      }
      pinned[index] = { x: cur.x, y: door.y }
    } else {
      if (Math.abs(cur.x - door.x) > CLEARANCE * 1.5) {
        break
      }
      pinned[index] = { x: door.x, y: cur.y }
    }
  }
  return simplifyOrthogonal(pinned)
}

function findGridPath(
  grid: WalkGrid,
  routeStart: Point,
  routeEnd: Point,
): Point[] | null {
  const direct = straightOrLOnWalk(grid, routeStart, routeEnd)
  if (direct) {
    return simplifyOrthogonal(direct)
  }
  const startCell = nearestWalkCell(grid, routeStart)
  const endCell = nearestWalkCell(grid, routeEnd)
  if (!startCell || !endCell) {
    return null
  }
  const cells = astarOrtho(grid, startCell, endCell)
  if (!cells || cells.length === 0) {
    return null
  }
  const startOnGrid = fromCell(grid, startCell.col, startCell.row)
  const endOnGrid = fromCell(grid, endCell.col, endCell.row)
  const pulled = pullOrtho(grid, [startOnGrid, ...cells, endOnGrid])
  const head = straightOrLOnWalk(grid, routeStart, pulled[0]) ?? [
    routeStart,
    ...orthoInsideRoom(routeStart, pulled[0]).slice(1),
  ]
  const tail = straightOrLOnWalk(
    grid,
    pulled[pulled.length - 1],
    routeEnd,
  ) ?? [
    ...orthoInsideRoom(pulled[pulled.length - 1], routeEnd).slice(0, -1),
    routeEnd,
  ]
  return ensureOrthogonal([
    ...head.slice(0, -1),
    ...pulled,
    ...tail.slice(1),
  ])
}

export function pathOnFloor(
  floor: Floor,
  start: Point,
  end: Point,
  options?: PathOnFloorOptions,
): Point[] {
  const containingStart =
    options?.startRoom ?? roomContainingPoint(floor.rooms, start)
  const endRoom = options?.endRoom ?? null

  if (
    containingStart &&
    endRoom &&
    containingStart.id === endRoom.id &&
    pointInRoom(start, containingStart)
  ) {
    const door =
      options?.endDoor ??
      roomDoorPoint(endRoom) ??
      end
    return ensureOrthogonal(orthoInsideRoom(start, door))
  }

  const endDoor = options?.endDoor ?? null
  const endSide = options?.endDoorSide ?? endRoom?.doorSide ?? null
  const endAnchor = endDoor ?? end

  const passThrough: Room[] = []
  if (containingStart && pointInRoom(start, containingStart)) {
    passThrough.push(containingStart)
  }
  if (endRoom && !passThrough.some((room) => room.id === endRoom.id)) {
    passThrough.push(endRoom)
  }
  for (const room of floor.rooms) {
    if (passThrough.some((item) => item.id === room.id)) {
      continue
    }
    if (pointInRoom(start, room, 2) || pointInRoom(endAnchor, room, 2)) {
      passThrough.push(room)
    }
  }
  const passThroughIds = passThrough.map((room) => room.id)

  const preferred = preferredWalkRects(floor, CLEARANCE, passThrough)
  const solids = solidBlockRects(floor, passThroughIds)
  const rawWalk = walkableRects(floor, passThrough)

  let startDoor = options?.startDoor ?? null
  let startSide = options?.startDoorSide ?? null
  const exitFromRoom =
    containingStart &&
    pointInRoom(start, containingStart) &&
    Boolean(containingStart.doorSide) &&
    containingStart.kind !== 'open'

  if (exitFromRoom && containingStart) {
    startDoor = roomDoorPoint(containingStart) ?? startDoor
    startSide = containingStart.doorSide
  }

  const routeStart = startDoor
    ? doorApproach(startDoor, startSide, preferred, rawWalk)
    : (snapToWalkable(rawWalk, start) ??
      snapToWalkable(preferred, start) ??
      start)

  const routeEnd = endDoor
    ? doorApproach(endDoor, endSide, preferred, rawWalk)
    : (snapToWalkable(rawWalk, end) ?? snapToWalkable(preferred, end) ?? end)

  if (!routeStart || !routeEnd) {
    return [start]
  }

  const walkOrigin = startDoor ? routeStart : start
  const sharedDirect =
    pathInSharedRect(rawWalk, walkOrigin, endDoor ?? routeEnd) ??
    pathInSharedRect(rawWalk, walkOrigin, routeEnd)

  function finalize(path: Point[]): Point[] {
    let points = [...path]
    if (startDoor) {
      if (!samePoint(points[0], routeStart, 1)) {
        points = [routeStart, ...points]
      }
      if (!samePoint(points[0], startDoor, 1)) {
        points = [startDoor, ...points]
      } else if (
        points.length >= 2 &&
        !samePoint(points[1], routeStart, 1) &&
        axisAligned(startDoor, routeStart)
      ) {
        points = [startDoor, routeStart, ...points.slice(1)]
      }
      points = pinDoorAxis(points, startDoor, startSide, true)
    }
    if (endDoor) {
      const last = points[points.length - 1]
      if (!samePoint(last, endDoor, 1)) {
        if (!samePoint(last, routeEnd, 1) && axisAligned(routeEnd, endDoor)) {
          points = [...points, routeEnd]
        }
        const tip = points[points.length - 1]
        if (axisAligned(tip, endDoor)) {
          points = [...points, endDoor]
        } else {
          points = [...points, ...orthoInsideRoom(tip, endDoor).slice(1)]
        }
      }
      points = pinDoorAxis(points, endDoor, endSide, false)
    }
    if (
      exitFromRoom &&
      containingStart &&
      startDoor &&
      pointInRoom(start, containingStart) &&
      !samePoint(start, points[0], 1)
    ) {
      points = [...orthoInsideRoom(start, points[0]).slice(0, -1), ...points]
    } else if (!startDoor && !samePoint(start, points[0], 1)) {
      points = [...orthoInsideRoom(start, points[0]).slice(0, -1), ...points]
    }
    return ensureOrthogonal(points)
  }

  if (sharedDirect) {
    return finalize(sharedDirect)
  }

  const preferredGrid = buildWalkGrid(preferred, solids)
  const fullGrid = buildWalkGrid(rawWalk, solids)
  const walked =
    (fullGrid ? findGridPath(fullGrid, walkOrigin, routeEnd) : null) ??
    (preferredGrid ? findGridPath(preferredGrid, walkOrigin, routeEnd) : null)

  if (!walked || walked.length === 0) {
    if (exitFromRoom && startDoor) {
      return ensureOrthogonal(orthoInsideRoom(start, startDoor))
    }
    return finalize(orthoInsideRoom(walkOrigin, routeEnd))
  }

  return finalize(walked)
}
