import type { Floor, Rect } from '../../types'
import { createId } from '../id'
import { uniqueMirroredRoomLabels } from '../rooms'
import {
  buildingCenter,
  isOnSourceSide,
  mirrorBox,
  mirrorDoorSide,
  mirrorPoint,
  nearBox,
  type SymmetryAxis,
} from './helpers'

export function mirrorFloorContent(
  floor: Floor,
  bounds: Rect,
  axis: SymmetryAxis,
): Floor {
  const { cx, cy } = buildingCenter(bounds)

  const rooms = [...floor.rooms]
  for (const room of floor.rooms) {
    const centerX = room.x + room.width / 2
    const centerY = room.y + room.height / 2
    if (!isOnSourceSide(centerX, centerY, axis, cx, cy)) {
      continue
    }
    const labels = uniqueMirroredRoomLabels(room, floor.name, rooms)
    const mirrored = {
      ...room,
      ...mirrorBox(room, axis, cx, cy),
      doorSide: mirrorDoorSide(room.doorSide, axis),
      id: createId('room'),
      name: labels.name,
      code: labels.code,
    }
    const exists = rooms.some((item) => nearBox(item, mirrored))
    if (!exists) {
      rooms.push(mirrored)
    }
  }

  const walls = [...(floor.walls ?? [])]
  for (const wall of floor.walls ?? []) {
    const centerX = wall.x + wall.width / 2
    const centerY = wall.y + wall.height / 2
    if (!isOnSourceSide(centerX, centerY, axis, cx, cy)) {
      continue
    }
    const mirrored = {
      ...wall,
      ...mirrorBox(wall, axis, cx, cy),
      id: createId('wall'),
    }
    const exists = walls.some((item) => nearBox(item, mirrored))
    if (!exists) {
      walls.push(mirrored)
    }
  }

  const passages = [...(floor.passages ?? [])]
  for (const passage of floor.passages ?? []) {
    const centerX = passage.x + passage.width / 2
    const centerY = passage.y + passage.height / 2
    if (!isOnSourceSide(centerX, centerY, axis, cx, cy)) {
      continue
    }
    const mirrored = {
      ...passage,
      ...mirrorBox(passage, axis, cx, cy),
      id: createId('path'),
    }
    const exists = passages.some((item) => nearBox(item, mirrored))
    if (!exists) {
      passages.push(mirrored)
    }
  }

  const qrMarkers = [...floor.qrMarkers]
  for (const marker of floor.qrMarkers) {
    if (!isOnSourceSide(marker.x, marker.y, axis, cx, cy)) {
      continue
    }
    const point = mirrorPoint(marker, axis, cx, cy)
    const exists = qrMarkers.some(
      (item) => Math.hypot(item.x - point.x, item.y - point.y) < 8,
    )
    if (!exists) {
      qrMarkers.push({
        ...marker,
        ...point,
        id: createId('qr'),
        label: `${marker.label} · R`,
      })
    }
  }

  const sourceCorridor = floor.corridor.filter((point) =>
    isOnSourceSide(point.x, point.y, axis, cx, cy),
  )
  let corridor = floor.corridor
  if (sourceCorridor.length >= 2) {
    const mirroredPath = sourceCorridor.map((point) =>
      mirrorPoint(point, axis, cx, cy),
    )
    const alreadyMirrored = mirroredPath.every((point) =>
      floor.corridor.some(
        (existing) => Math.hypot(existing.x - point.x, existing.y - point.y) < 8,
      ),
    )
    if (!alreadyMirrored) {
      corridor = [...floor.corridor, ...mirroredPath.reverse()]
    }
  }

  return {
    ...floor,
    rooms,
    walls,
    passages,
    qrMarkers,
    corridor,
  }
}
