import type { Elevator, Point } from '../types'
import { normalizeDoorSide } from './rooms'

export const DEFAULT_ELEVATOR_SIZE = 56

export function elevatorSize(elevator: Pick<Elevator, 'width' | 'height'>): {
  width: number
  height: number
} {
  return {
    width: Math.max(24, elevator.width ?? DEFAULT_ELEVATOR_SIZE),
    height: Math.max(24, elevator.height ?? DEFAULT_ELEVATOR_SIZE),
  }
}

export function normalizeElevator(
  raw: Partial<Elevator> & { id: string },
): Elevator {
  const size = elevatorSize({
    width: raw.width ?? DEFAULT_ELEVATOR_SIZE,
    height: raw.height ?? DEFAULT_ELEVATOR_SIZE,
  })
  return {
    id: raw.id,
    side: raw.side === 'right' ? 'right' : 'left',
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    width: size.width,
    height: size.height,
    label: raw.label ?? 'Elevator',
    doorSide: normalizeDoorSide(raw.doorSide),
  }
}

export function elevatorDoorPoint(elevator: Elevator): Point | null {
  if (!elevator.doorSide) {
    return null
  }
  const { width, height } = elevatorSize(elevator)
  const halfW = width / 2
  const halfH = height / 2
  if (elevator.doorSide === 'n') {
    return { x: elevator.x, y: elevator.y - halfH }
  }
  if (elevator.doorSide === 'e') {
    return { x: elevator.x + halfW, y: elevator.y }
  }
  if (elevator.doorSide === 's') {
    return { x: elevator.x, y: elevator.y + halfH }
  }
  return { x: elevator.x - halfW, y: elevator.y }
}

export function elevatorDoorLocal(elevator: Elevator): Point | null {
  if (!elevator.doorSide) {
    return null
  }
  const { width, height } = elevatorSize(elevator)
  const halfW = width / 2
  const halfH = height / 2
  if (elevator.doorSide === 'n') {
    return { x: 0, y: -halfH }
  }
  if (elevator.doorSide === 'e') {
    return { x: halfW, y: 0 }
  }
  if (elevator.doorSide === 's') {
    return { x: 0, y: halfH }
  }
  return { x: -halfW, y: 0 }
}
