import type { Building, Elevator, Point, Room } from '../../types'
import { elevatorDoorPoint } from '../elevators'
import { roomDoorPoint } from '../rooms'
import { pathOnFloor } from './astar'
import type { NavRoute, RouteDestination } from './types'
import { dist } from './walkGrid'

function elevTarget(elevator: Elevator): Point {
  return (
    elevatorDoorPoint(elevator) ?? {
      x: elevator.x,
      y: elevator.y,
    }
  )
}

function roomTarget(room: Room): Point {
  return roomDoorPoint(room) ?? {
    x: room.x + room.width / 2,
    y: room.y + room.height / 2,
  }
}

function nearestElevator(
  elevators: Elevator[],
  from: Point,
): Elevator | null {
  if (elevators.length === 0) {
    return null
  }
  return [...elevators].sort(
    (a, b) => dist(elevTarget(a), from) - dist(elevTarget(b), from),
  )[0]
}

export function listDestinations(building: Building): RouteDestination[] {
  const rooms = building.floors.flatMap((floor) =>
    floor.rooms.map((room) => ({
      type: 'room' as const,
      id: room.id,
      floorId: floor.id,
      label: `${floor.name} · ${room.name}${room.code ? ` (${room.code})` : ''}`,
    })),
  )
  const elevators = (building.elevators ?? []).map((elevator) => ({
    type: 'elevator' as const,
    id: elevator.id,
    label: elevator.label,
  }))
  return [...rooms, ...elevators]
}

export function buildRoute(
  building: Building,
  startFloorId: string,
  startPoint: Point,
  destination: RouteDestination,
): NavRoute | null {
  const floors = [...building.floors].sort((a, b) => a.order - b.order)
  const startFloor = floors.find((floor) => floor.id === startFloorId)
  if (!startFloor) {
    return null
  }

  if (destination.type === 'elevator') {
    const elevator = (building.elevators ?? []).find(
      (item) => item.id === destination.id,
    )
    if (!elevator) {
      return null
    }
    const end = elevTarget(elevator)
    return {
      legs: [
        {
          floorId: startFloor.id,
          floorName: startFloor.name,
          points: pathOnFloor(startFloor, startPoint, end),
        },
      ],
      summary: `Walk to ${elevator.label}`,
    }
  }

  const destFloor = floors.find((floor) => floor.id === destination.floorId)
  const destRoom = destFloor?.rooms.find((room) => room.id === destination.id)
  if (!destFloor || !destRoom) {
    return null
  }

  const end = roomTarget(destRoom)

  if (destFloor.id === startFloor.id) {
    return {
      legs: [
        {
          floorId: startFloor.id,
          floorName: startFloor.name,
          points: pathOnFloor(startFloor, startPoint, end),
        },
      ],
      summary: `Walk to ${destRoom.name}`,
    }
  }

  const elevator = nearestElevator(building.elevators ?? [], startPoint)
  if (!elevator) {
    return {
      legs: [
        {
          floorId: startFloor.id,
          floorName: startFloor.name,
          points: [startPoint],
          note: 'No elevator placed — add an elevator in Map Studio for multi-floor routes.',
        },
      ],
      summary: 'Cannot route between floors without an elevator',
    }
  }

  const elevPoint = elevTarget(elevator)
  return {
    legs: [
      {
        floorId: startFloor.id,
        floorName: startFloor.name,
        points: pathOnFloor(startFloor, startPoint, elevPoint),
        note: `Take ${elevator.label} to floor ${destFloor.name}`,
      },
      {
        floorId: destFloor.id,
        floorName: destFloor.name,
        points: pathOnFloor(destFloor, elevPoint, end),
      },
    ],
    summary: `${startFloor.name} → ${elevator.label} → ${destFloor.name} · ${destRoom.name}`,
  }
}
