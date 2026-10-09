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
  }
}

export function roomDefaults(
  kind: RoomKind,
  floorName: string,
  index: number,
): { name: string; code: string; kind: RoomKind; doorSide: DoorSide | null } {
  const preset = ROOM_KIND_PRESETS[kind]
  if (kind === 'room') {
    return {
      kind,
      name: `${preset.name} ${index}`,
      code: `${floorName}.${String(index).padStart(2, '0')}`,
      doorSide: null,
    }
  }
  if (kind === 'open') {
    return {
      kind,
      name: `${preset.name} ${index}`,
      code: `${preset.codePrefix}-${floorName}-${String(index).padStart(2, '0')}`,
      doorSide: null,
    }
  }
  return {
    kind,
    name: `${preset.name} ${index}`,
    code: `${preset.codePrefix}-${floorName}-${String(index).padStart(2, '0')}`,
    doorSide: null,
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
  const midX = room.x + room.width / 2
  const midY = room.y + room.height / 2
  if (room.doorSide === 'n') {
    return { x: midX, y: room.y }
  }
  if (room.doorSide === 'e') {
    return { x: room.x + room.width, y: midY }
  }
  if (room.doorSide === 's') {
    return { x: midX, y: room.y + room.height }
  }
  return { x: room.x, y: midY }
}
