import type { Elevator, EmergencyExit, Rect } from '../../types'
import { createId } from '../id'
import {
  buildingCenter,
  isOnSourceSide,
  mirrorDoorSide,
  mirrorPoint,
  type SymmetryAxis,
} from './helpers'

export function mirrorBuildingMarkers<T extends { id: string; x: number; y: number }>(
  items: T[],
  bounds: Rect,
  axis: SymmetryAxis,
  idPrefix: string,
): T[] {
  const { cx, cy } = buildingCenter(bounds)
  const next = [...items]
  for (const item of items) {
    if (!isOnSourceSide(item.x, item.y, axis, cx, cy)) {
      continue
    }
    const point = mirrorPoint(item, axis, cx, cy)
    const exists = next.some(
      (other) => Math.hypot(other.x - point.x, other.y - point.y) < 8,
    )
    if (!exists) {
      next.push({
        ...item,
        ...point,
        id: createId(idPrefix),
      })
    }
  }
  return next
}

export function mirrorElevators(
  elevators: Elevator[],
  bounds: Rect,
  axis: SymmetryAxis,
): Elevator[] {
  const mirrored = mirrorBuildingMarkers(elevators, bounds, axis, 'elev')
  return mirrored.map((elevator) => {
    if (elevators.some((item) => item.id === elevator.id)) {
      return elevator
    }
    return {
      ...elevator,
      side: elevator.side === 'left' ? 'right' : 'left',
      doorSide: mirrorDoorSide(elevator.doorSide, axis),
      label:
        elevator.side === 'left'
          ? elevator.label.replace(/L\b/i, 'R') || 'Elevator R'
          : elevator.label.replace(/R\b/i, 'L') || 'Elevator L',
    }
  })
}

export function mirrorEmergencyExits(
  exits: EmergencyExit[],
  bounds: Rect,
  axis: SymmetryAxis,
): EmergencyExit[] {
  return mirrorBuildingMarkers(exits, bounds, axis, 'exit').map((exit) => {
    if (exits.some((item) => item.id === exit.id)) {
      return exit
    }
    return {
      ...exit,
      label: exit.label.includes('· R') ? exit.label : `${exit.label} · R`,
    }
  })
}
