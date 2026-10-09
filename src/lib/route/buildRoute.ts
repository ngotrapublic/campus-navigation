import type { Building, Elevator, Floor, Point, Room } from '../../types'
import { elevatorDoorPoint } from '../elevators'
import { roomDoorPoint } from '../rooms'
import {
  canUseYardLink,
  nearestYardDoor,
  yardDoorPoint,
} from '../yardLink'
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

function pathToRoom(floor: Floor, start: Point, room: Room) {
  const end = roomTarget(room)
  return pathOnFloor(floor, start, end, {
    endRoom: room,
    endDoor: room.doorSide ? end : null,
    endDoorSide: room.doorSide,
  })
}

function pathToElevator(floor: Floor, start: Point, elevator: Elevator) {
  const end = elevTarget(elevator)
  return pathOnFloor(floor, start, end, {
    endDoor: end,
    endDoorSide: elevator.doorSide,
  })
}

function pathFromElevator(
  floor: Floor,
  elevator: Elevator,
  end: Point,
  endRoom?: Room | null,
) {
  const start = elevTarget(elevator)
  return pathOnFloor(floor, start, end, {
    startDoor: start,
    startDoorSide: elevator.doorSide,
    endRoom: endRoom ?? null,
    endDoor: endRoom?.doorSide ? end : null,
    endDoorSide: endRoom?.doorSide ?? null,
  })
}

function pathToYardDoor(floor: Floor, start: Point) {
  const door = nearestYardDoor(floor, start)
  if (!door) {
    return [start]
  }
  const end = yardDoorPoint(door)
  return pathOnFloor(floor, start, end, {
    endDoor: end,
    endDoorSide: door.doorSide,
  })
}

function pathFromYardDoor(
  floor: Floor,
  end: Point,
  endRoom?: Room | null,
) {
  const door = nearestYardDoor(floor, end)
  if (!door) {
    return [end]
  }
  const start = yardDoorPoint(door)
  return pathOnFloor(floor, start, end, {
    startDoor: start,
    startDoorSide: door.doorSide,
    endRoom: endRoom ?? null,
    endDoor: endRoom?.doorSide ? end : null,
    endDoorSide: endRoom?.doorSide ?? null,
  })
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

type WcCandidate = {
  floor: Floor
  room: Room
  score: number
}

const YARD_TRANSFER_COST = 40
const ELEVATOR_FLOOR_COST = 80

function yardTransferScore(
  building: Building,
  startFloorId: string,
  startPoint: Point,
  destFloor: Floor,
  destPoint: Point,
): number | null {
  if (!canUseYardLink(building, startFloorId, destFloor.id)) {
    return null
  }
  const startFloor = building.floors.find((floor) => floor.id === startFloorId)
  if (!startFloor) {
    return null
  }
  const startDoor = nearestYardDoor(startFloor, startPoint)
  const destDoor = nearestYardDoor(destFloor, destPoint)
  if (!startDoor || !destDoor) {
    return null
  }
  return (
    dist(startPoint, yardDoorPoint(startDoor)) +
    dist(yardDoorPoint(destDoor), destPoint) +
    YARD_TRANSFER_COST
  )
}

function elevatorTransferScore(
  building: Building,
  startFloorId: string,
  startPoint: Point,
  destFloor: Floor,
  destPoint: Point,
): { score: number; elevator: Elevator } | null {
  const elevator = nearestElevator(building.elevators ?? [], startPoint)
  if (!elevator) {
    return null
  }
  const startFloor = building.floors.find((floor) => floor.id === startFloorId)
  const floorDelta = Math.abs(
    destFloor.order - (startFloor?.order ?? destFloor.order),
  )
  return {
    elevator,
    score:
      dist(startPoint, elevTarget(elevator)) +
      dist(elevTarget(elevator), destPoint) +
      floorDelta * ELEVATOR_FLOOR_COST,
  }
}

function nearestWc(
  building: Building,
  startFloorId: string,
  startPoint: Point,
  kind: 'wc_male' | 'wc_female',
): WcCandidate | null {
  const candidates: WcCandidate[] = []

  for (const floor of building.floors) {
    for (const room of floor.rooms) {
      if ((room.kind ?? 'room') !== kind) {
        continue
      }
      const target = roomTarget(room)
      if (floor.id === startFloorId) {
        candidates.push({ floor, room, score: dist(startPoint, target) })
        continue
      }
      const yardScore = yardTransferScore(
        building,
        startFloorId,
        startPoint,
        floor,
        target,
      )
      const elev = elevatorTransferScore(
        building,
        startFloorId,
        startPoint,
        floor,
        target,
      )
      const scores = [
        yardScore,
        elev?.score ?? null,
      ].filter((score): score is number => score !== null)
      if (scores.length === 0) {
        continue
      }
      candidates.push({ floor, room, score: Math.min(...scores) })
    }
  }

  if (candidates.length === 0) {
    return null
  }
  return candidates.sort((a, b) => a.score - b.score)[0]
}

function routeViaYard(
  startFloor: Floor,
  startPoint: Point,
  destFloor: Floor,
  destRoom: Room,
  end: Point,
): NavRoute {
  return {
    legs: [
      {
        floorId: startFloor.id,
        floorName: startFloor.name,
        points: pathToYardDoor(startFloor, startPoint),
        note: `Exit to yard, then enter floor ${destFloor.name}`,
      },
      {
        floorId: destFloor.id,
        floorName: destFloor.name,
        points: pathFromYardDoor(destFloor, end, destRoom),
      },
    ],
    summary: `${startFloor.name} → Yard → ${destFloor.name} · ${destRoom.name}`,
  }
}

function routeViaElevator(
  startFloor: Floor,
  startPoint: Point,
  destFloor: Floor,
  destRoom: Room,
  end: Point,
  elevator: Elevator,
): NavRoute {
  return {
    legs: [
      {
        floorId: startFloor.id,
        floorName: startFloor.name,
        points: pathToElevator(startFloor, startPoint, elevator),
        note: `Take ${elevator.label} to floor ${destFloor.name}`,
      },
      {
        floorId: destFloor.id,
        floorName: destFloor.name,
        points: pathFromElevator(destFloor, elevator, end, destRoom),
      },
    ],
    summary: `${startFloor.name} → ${elevator.label} → ${destFloor.name} · ${destRoom.name}`,
  }
}

function routeToRoomOnFloor(
  building: Building,
  startFloor: Floor,
  startPoint: Point,
  destFloor: Floor,
  destRoom: Room,
): NavRoute {
  const end = roomTarget(destRoom)

  if (destFloor.id === startFloor.id) {
    return {
      legs: [
        {
          floorId: startFloor.id,
          floorName: startFloor.name,
          points: pathToRoom(startFloor, startPoint, destRoom),
        },
      ],
      summary: `Walk to ${destRoom.name}`,
    }
  }

  const yardScore = yardTransferScore(
    building,
    startFloor.id,
    startPoint,
    destFloor,
    end,
  )
  const elev = elevatorTransferScore(
    building,
    startFloor.id,
    startPoint,
    destFloor,
    end,
  )

  if (yardScore !== null && elev !== null) {
    if (elev.score <= yardScore) {
      return routeViaElevator(
        startFloor,
        startPoint,
        destFloor,
        destRoom,
        end,
        elev.elevator,
      )
    }
    return routeViaYard(startFloor, startPoint, destFloor, destRoom, end)
  }

  if (yardScore !== null) {
    return routeViaYard(startFloor, startPoint, destFloor, destRoom, end)
  }

  if (elev) {
    return routeViaElevator(
      startFloor,
      startPoint,
      destFloor,
      destRoom,
      end,
      elev.elevator,
    )
  }

  return {
    legs: [
      {
        floorId: startFloor.id,
        floorName: startFloor.name,
        points: [startPoint],
        note: 'No elevator or yard link — enable yard link / place yard doors, or add an elevator.',
      },
    ],
    summary: 'Cannot route between floors',
  }
}

export function listDestinations(building: Building): RouteDestination[] {
  const rooms = building.floors.flatMap((floor) =>
    floor.rooms
      .filter((room) => {
        const kind = room.kind ?? 'room'
        return kind !== 'wc_male' && kind !== 'wc_female'
      })
      .map((room) => ({
        type: 'room' as const,
        id: room.id,
        floorId: floor.id,
        label: `${floor.name} · ${room.name}${room.code ? ` (${room.code})` : ''}`,
      })),
  )

  const hasMale = building.floors.some((floor) =>
    floor.rooms.some((room) => room.kind === 'wc_male'),
  )
  const hasFemale = building.floors.some((floor) =>
    floor.rooms.some((room) => room.kind === 'wc_female'),
  )

  const wcs: RouteDestination[] = []
  if (hasMale) {
    wcs.push({
      type: 'wc',
      id: 'wc_male',
      kind: 'wc_male',
      label: 'WC Male (nearest)',
    })
  }
  if (hasFemale) {
    wcs.push({
      type: 'wc',
      id: 'wc_female',
      kind: 'wc_female',
      label: 'WC Female (nearest)',
    })
  }

  const elevators = (building.elevators ?? []).map((elevator) => ({
    type: 'elevator' as const,
    id: elevator.id,
    label: elevator.label,
  }))

  return [...rooms, ...wcs, ...elevators]
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
    return {
      legs: [
        {
          floorId: startFloor.id,
          floorName: startFloor.name,
          points: pathToElevator(startFloor, startPoint, elevator),
        },
      ],
      summary: `Walk to ${elevator.label}`,
    }
  }

  if (destination.type === 'wc') {
    const nearest = nearestWc(
      building,
      startFloorId,
      startPoint,
      destination.kind,
    )
    if (!nearest) {
      return null
    }
    const route = routeToRoomOnFloor(
      building,
      startFloor,
      startPoint,
      nearest.floor,
      nearest.room,
    )
    return {
      ...route,
      summary: `Nearest ${destination.label.replace(' (nearest)', '')}: ${nearest.floor.name} · ${nearest.room.name}`,
    }
  }

  const destFloor = floors.find((floor) => floor.id === destination.floorId)
  const destRoom = destFloor?.rooms.find((room) => room.id === destination.id)
  if (!destFloor || !destRoom) {
    return null
  }

  return routeToRoomOnFloor(
    building,
    startFloor,
    startPoint,
    destFloor,
    destRoom,
  )
}
