import type { Building, Floor, Point, YardDoor } from '../types'
import { createId } from './id'

export function floorsByOrder(building: Building): Floor[] {
  return [...building.floors].sort((a, b) => a.order - b.order)
}

export function twoLowestFloors(building: Building): Floor[] {
  return floorsByOrder(building).slice(0, 2)
}

export function isYardLinkFloor(building: Building, floorId: string): boolean {
  if (!building.yardLinkEnabled) {
    return false
  }
  return twoLowestFloors(building).some((floor) => floor.id === floorId)
}

export function floorYardDoors(floor: Floor): YardDoor[] {
  return floor.yardDoors ?? []
}

export function yardLinkReady(building: Building): boolean {
  if (!building.yardLinkEnabled) {
    return false
  }
  const pair = twoLowestFloors(building)
  if (pair.length < 2) {
    return false
  }
  return pair.every((floor) => floorYardDoors(floor).length > 0)
}

export function canUseYardLink(
  building: Building,
  floorAId: string,
  floorBId: string,
): boolean {
  if (!yardLinkReady(building)) {
    return false
  }
  const pair = twoLowestFloors(building)
  const ids = new Set(pair.map((floor) => floor.id))
  return ids.has(floorAId) && ids.has(floorBId) && floorAId !== floorBId
}

export function yardDoorPoint(door: YardDoor): Point {
  return { x: door.x, y: door.y }
}

export function nearestYardDoor(floor: Floor, from: Point): YardDoor | null {
  const doors = floorYardDoors(floor)
  if (doors.length === 0) {
    return null
  }
  return [...doors].sort(
    (a, b) =>
      Math.hypot(a.x - from.x, a.y - from.y) -
      Math.hypot(b.x - from.x, b.y - from.y),
  )[0]
}

export function normalizeYardDoor(
  raw: Partial<YardDoor> & { id?: string },
  index = 1,
): YardDoor {
  const side = raw.doorSide
  return {
    id: raw.id ?? createId('yard'),
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    doorSide:
      side === 'n' || side === 'e' || side === 's' || side === 'w' ? side : null,
    label: raw.label ?? `Yard door ${index}`,
  }
}

export function normalizeYardDoors(
  floor: Partial<Floor> & { yardDoor?: unknown },
): YardDoor[] {
  if (Array.isArray(floor.yardDoors)) {
    return floor.yardDoors.map((door, index) =>
      normalizeYardDoor(door, index + 1),
    )
  }
  if (floor.yardDoor && typeof floor.yardDoor === 'object') {
    return [normalizeYardDoor(floor.yardDoor as Partial<YardDoor>, 1)]
  }
  return []
}
