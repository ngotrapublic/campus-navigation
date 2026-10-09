import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Point, Rect, Floor } from '../../types'
import type { BuildingSite } from '../../types'
import type { Elevator } from '../../types'
import { clampPointToRect, clampRoomToRect, sitePatchFromDivider } from '../../lib/site'
import { elevatorSize } from '../../lib/elevators'
import { roomDefaults } from '../../lib/rooms'
import { snapBoxMove, snapBoxResize, type SnapGuide } from '../../lib/snap'
import type { DragState } from './types'
import { resizeRoomRect, svgPoint } from './canvasUtils'
import type { CampusStore } from '../../store/useCampusStore'

export type MoveUpContext = {
  svgRef: React.RefObject<SVGSVGElement | null>
  view: Rect
  isInterior: boolean
  site: BuildingSite
  building: Rect
  floor: Floor | null
  elevators: Elevator[]
  drag: DragState
  setDrag: (drag: DragState) => void
  setSnapGuides: (guides: SnapGuide[]) => void
  updateSite: CampusStore['updateSite']
  updateRoom: CampusStore['updateRoom']
  updateWall: CampusStore['updateWall']
  updatePassage: CampusStore['updatePassage']
  updateElevator: CampusStore['updateElevator']
  updateEmergencyExit: CampusStore['updateEmergencyExit']
  updateYardDoor: CampusStore['updateYardDoor']
  updateQrMarker: CampusStore['updateQrMarker']
  moveCorridorPoint: CampusStore['moveCorridorPoint']
  addRoom: CampusStore['addRoom']
  addWall: CampusStore['addWall']
  addPassage: CampusStore['addPassage']
}

function clampToBuilding(point: Point, building: Rect, margin = 0): Point {
  return clampPointToRect(point, building, margin)
}

function floorSnapBoxes(floor: Floor, excludeId?: string) {
  return [
    ...floor.rooms.map((room) => ({
      id: room.id,
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
    })),
    ...(floor.walls ?? []).map((wall) => ({
      id: wall.id,
      x: wall.x,
      y: wall.y,
      width: wall.width,
      height: wall.height,
    })),
    ...(floor.passages ?? []).map((passage) => ({
      id: passage.id,
      x: passage.x,
      y: passage.y,
      width: passage.width,
      height: passage.height,
    })),
  ].filter((box) => box.id !== excludeId)
}

export function createPointerMove(ctx: MoveUpContext) {
  return function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const { drag } = ctx
    if (!drag || !ctx.svgRef.current) return
    const point = svgPoint(ctx.svgRef.current, event.clientX, event.clientY, ctx.view)
    if (drag.kind === 'divider') {
      ctx.updateSite(sitePatchFromDivider(ctx.site, point))
      return
    }
    if (!ctx.isInterior || !ctx.floor) return
    const floor = ctx.floor
    const building = ctx.building
    if (drag.kind === 'room-create' || drag.kind === 'wall-create' || drag.kind === 'passage-create') {
      ctx.setDrag({ ...drag, current: clampToBuilding(point, building, 8) })
      return
    }
    if (drag.kind === 'room-move' || drag.kind === 'wall-move' || drag.kind === 'passage-move') {
      const source =
        drag.kind === 'room-move'
          ? floor.rooms.find((item) => item.id === drag.id)
          : drag.kind === 'wall-move'
            ? (floor.walls ?? []).find((item) => item.id === drag.id)
            : (floor.passages ?? []).find((item) => item.id === drag.id)
      if (!source) return
      const proposed = clampRoomToRect(
        {
          x: point.x - drag.offset.x,
          y: point.y - drag.offset.y,
          width: source.width,
          height: source.height,
        },
        building,
      )
      const snapped = snapBoxMove({ id: source.id, ...proposed }, floorSnapBoxes(floor, source.id), building)
      const next = clampRoomToRect(snapped.box, building)
      ctx.setSnapGuides(snapped.guides)
      if (drag.kind === 'room-move') ctx.updateRoom(drag.id, { x: next.x, y: next.y })
      else if (drag.kind === 'wall-move') ctx.updateWall(drag.id, { x: next.x, y: next.y })
      else ctx.updatePassage(drag.id, { x: next.x, y: next.y })
      return
    }
    if (drag.kind === 'room-resize' || drag.kind === 'wall-resize' || drag.kind === 'passage-resize') {
      const proposed = clampRoomToRect(resizeRoomRect(drag.origin, drag.handle, point), building)
      const snapped = snapBoxResize({ id: drag.id, ...proposed }, drag.handle, floorSnapBoxes(floor, drag.id), building)
      const next = clampRoomToRect(snapped.box, building)
      ctx.setSnapGuides(snapped.guides)
      if (drag.kind === 'room-resize') ctx.updateRoom(drag.id, next)
      else if (drag.kind === 'wall-resize') ctx.updateWall(drag.id, next)
      else ctx.updatePassage(drag.id, next)
      return
    }
    if (drag.kind === 'elevator-move') {
      const elevator = ctx.elevators.find((item) => item.id === drag.id)
      const size = elevator ? elevatorSize(elevator) : { width: 56, height: 56 }
      ctx.updateElevator(
        drag.id,
        clampToBuilding(
          { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
          building,
          Math.max(size.width, size.height) / 2,
        ),
      )
      return
    }
    if (drag.kind === 'elevator-resize') {
      const box = clampRoomToRect(resizeRoomRect(drag.origin, drag.handle, point), building)
      ctx.updateElevator(drag.id, {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
        width: box.width,
        height: box.height,
      })
      return
    }
    if (drag.kind === 'exit-move') {
      ctx.updateEmergencyExit(
        drag.id,
        clampToBuilding({ x: point.x - drag.offset.x, y: point.y - drag.offset.y }, building, 24),
      )
      return
    }
    if (drag.kind === 'yard-door-move') {
      ctx.updateYardDoor(
        drag.id,
        clampToBuilding(
          { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
          building,
          24,
        ),
      )
      return
    }
    if (drag.kind === 'qr-move') {
      ctx.updateQrMarker(
        drag.id,
        clampToBuilding({ x: point.x - drag.offset.x, y: point.y - drag.offset.y }, building, 16),
      )
      return
    }
    if (drag.kind === 'corridor-point') {
      ctx.moveCorridorPoint(drag.index, clampToBuilding(point, building, 8))
    }
  }
}

export function createPointerUp(ctx: MoveUpContext) {
  return function handlePointerUp() {
    const { drag, floor, building } = ctx
    ctx.setSnapGuides([])
    if (drag?.kind === 'room-create' && floor) {
      const raw = {
        x: Math.min(drag.start.x, drag.current.x),
        y: Math.min(drag.start.y, drag.current.y),
        width: Math.abs(drag.current.x - drag.start.x),
        height: Math.abs(drag.current.y - drag.start.y),
      }
      const next = clampRoomToRect(raw, building)
      if (next.width > 24 && next.height > 24) {
        const n = floor.rooms.length + 1
        ctx.addRoom({ ...roomDefaults(drag.roomKind, floor.name, n), ...next })
      }
    }
    if (drag?.kind === 'wall-create' || drag?.kind === 'passage-create') {
      const raw = {
        x: Math.min(drag.start.x, drag.current.x),
        y: Math.min(drag.start.y, drag.current.y),
        width: Math.abs(drag.current.x - drag.start.x),
        height: Math.abs(drag.current.y - drag.start.y),
      }
      const next = clampRoomToRect(raw, building)
      if (next.width > 16 && next.height > 8) {
        if (drag.kind === 'wall-create') ctx.addWall(next)
        else ctx.addPassage(next)
      }
    }
    ctx.setDrag(null)
  }
}
