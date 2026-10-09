import type { DoorSide, Point, Room, RoomKind } from '../types'
import { ROOM_KIND_PRESETS } from '../types'

export function normalizeRoomKind(kind?: string | null): RoomKind {
  if (
    kind === 'wc_male' ||
    kind === 'wc_female' ||
    kind === 'room' ||
    kind === 'open'
  ) {
    return kind
  }
  return 'room'
}

export function normalizeDoorSide(side?: string | null): DoorSide | null {
  if (side === 'n' || side === 'e' || side === 's' || side === 'w') {
    return side
  }
  return null
}

export function normalizeDoorAlong(value?: number | null): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.5
  }
  return Math.min(1, Math.max(0, value))
}

export function normalizeRoom(raw: Partial<Room> & { id: string }): Room {
  return {
    id: raw.id,
    kind: normalizeRoomKind(raw.kind),
    name: raw.name ?? 'Room',
    code: raw.code ?? '',
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    width: raw.width ?? 40,
    height: raw.height ?? 40,
    doorSide: normalizeDoorSide(raw.doorSide),
    doorAlong: normalizeDoorAlong(raw.doorAlong),
  }
}

export function roomDefaults(
  kind: RoomKind,
  floorName: string,
  index: number,
): {
  name: string
  code: string
  kind: RoomKind
  doorSide: DoorSide | null
  doorAlong: number
} {
  const preset = ROOM_KIND_PRESETS[kind]
  if (kind === 'room') {
    return {
      kind,
      name: `${preset.name} ${index}`,
      code: `${floorName}.${String(index).padStart(2, '0')}`,
      doorSide: null,
      doorAlong: 0.5,
    }
  }
  if (kind === 'open') {
    return {
      kind,
      name: `${preset.name} ${index}`,
      code: `${preset.codePrefix}-${floorName}-${String(index).padStart(2, '0')}`,
      doorSide: null,
      doorAlong: 0.5,
    }
  }
  return {
    kind,
    name: `${preset.name} ${index}`,
    code: `${preset.codePrefix}-${floorName}-${String(index).padStart(2, '0')}`,
    doorSide: null,
    doorAlong: 0.5,
  }
}

export function nextRoomIndex(rooms: Room[], kind: RoomKind): number {
  const count = rooms.filter((room) => (room.kind ?? 'room') === kind).length
  return count + 1
}

export function uniqueMirroredRoomLabels(
  room: Room,
  floorName: string,
  existing: Room[],
): { name: string; code: string } {
  let index = nextRoomIndex(existing, room.kind ?? 'room')
  let labels = roomDefaults(room.kind ?? 'room', floorName, index)
  while (
    existing.some(
      (item) =>
        item.name === labels.name ||
        (labels.code !== '' && item.code === labels.code),
    )
  ) {
    index += 1
    labels = roomDefaults(room.kind ?? 'room', floorName, index)
  }
  return { name: labels.name, code: labels.code }
}

export function roomFill(kind: RoomKind, selected: boolean): string {
  if (kind === 'open') {
    return selected ? 'rgba(120, 160, 140, 0.22)' : 'rgba(120, 160, 140, 0.12)'
  }
  if (kind === 'wc_male') {
    return selected ? '#d7e8f7' : '#e8f2fb'
  }
  if (kind === 'wc_female') {
    return selected ? '#f7dce8' : '#fbeaf1'
  }
  return selected ? '#dfece6' : '#f7fbf8'
}

export function roomStroke(kind: RoomKind, selected: boolean): string {
  if (kind === 'open') {
    return selected ? '#c45c26' : '#5a7a68'
  }
  if (kind === 'wc_male') {
    return selected ? '#c45c26' : '#3b6ea5'
  }
  if (kind === 'wc_female') {
    return selected ? '#c45c26' : '#a34d72'
  }
  return selected ? '#c45c26' : '#355e50'
}

export function roomDoorPoint(room: Room): Point | null {
  if (!room.doorSide || room.kind === 'open') {
    return null
  }
  const along = normalizeDoorAlong(room.doorAlong)
  if (room.doorSide === 'n') {
    return { x: room.x + room.width * along, y: room.y }
  }
  if (room.doorSide === 'e') {
    return { x: room.x + room.width, y: room.y + room.height * along }
  }
  if (room.doorSide === 's') {
    return { x: room.x + room.width * along, y: room.y + room.height }
  }
  return { x: room.x, y: room.y + room.height * along }
}

export function doorAlongFromPoint(room: Room, point: Point): number {
  if (!room.doorSide) {
    return 0.5
  }
  if (room.doorSide === 'n' || room.doorSide === 's') {
    if (room.width <= 0) {
      return 0.5
    }
    return normalizeDoorAlong((point.x - room.x) / room.width)
  }
  if (room.height <= 0) {
    return 0.5
  }
  return normalizeDoorAlong((point.y - room.y) / room.height)
}

export function pointInRoom(point: Point, room: Room, pad = 0): boolean {
  return (
    point.x >= room.x - pad &&
    point.x <= room.x + room.width + pad &&
    point.y >= room.y - pad &&
    point.y <= room.y + room.height + pad
  )
}

export function roomContainingPoint(
  rooms: Room[],
  point: Point,
): Room | null {
  for (const room of rooms) {
    if ((room.kind ?? 'room') === 'open') {
      continue
    }
    if (pointInRoom(point, room)) {
      return room
    }
  }
  return null
}

export function orthoInsideRoom(from: Point, to: Point): Point[] {
  if (
    Math.abs(from.x - to.x) < 0.5 &&
    Math.abs(from.y - to.y) < 0.5
  ) {
    return [from]
  }
  if (Math.abs(from.x - to.x) < 0.5 || Math.abs(from.y - to.y) < 0.5) {
    return [from, to]
  }
  return [from, { x: to.x, y: from.y }, to]
}
