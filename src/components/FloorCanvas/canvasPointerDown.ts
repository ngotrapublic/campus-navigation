import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Rect, Floor } from '../../types'
import type { BuildingSite } from '../../types'
import type { Elevator, EmergencyExit } from '../../types'
import { clampPointToRect } from '../../lib/site'
import type { DragState } from './types'
import { svgPoint } from './canvasUtils'
import type { CampusStore } from '../../store/useCampusStore'
import { handleSelectDown } from './canvasPointerSelect'

export type DownContext = {
  svgRef: React.RefObject<SVGSVGElement | null>
  view: Rect
  isInterior: boolean
  site: BuildingSite
  building: Rect
  floor: Floor | null
  elevators: Elevator[]
  emergencyExits: EmergencyExit[]
  tool: CampusStore['tool']
  setDrag: (drag: DragState) => void
  setSelected: CampusStore['setSelected']
  removeRoom: CampusStore['removeRoom']
  removeWall: CampusStore['removeWall']
  removePassage: CampusStore['removePassage']
  removeElevator: CampusStore['removeElevator']
  addElevator: CampusStore['addElevator']
  addEmergencyExit: CampusStore['addEmergencyExit']
  addCorridorPoint: CampusStore['addCorridorPoint']
  addQrMarker: CampusStore['addQrMarker']
  updateSite: CampusStore['updateSite']
}

function clampToBuilding(
  point: { x: number; y: number },
  building: Rect,
  margin = 0,
) {
  return clampPointToRect(point, building, margin)
}

export function createPointerDown(ctx: DownContext) {
  return function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!ctx.svgRef.current || event.button !== 0) return
    const point = svgPoint(ctx.svgRef.current, event.clientX, event.clientY, ctx.view)
    const target = event.target as SVGElement
    const entity = target.dataset.entity
    const entityId = target.dataset.id
    if (!ctx.isInterior) {
      if (entity === 'divider') ctx.setDrag({ kind: 'divider' })
      return
    }
    if (ctx.tool === 'select') {
      handleSelectDown(ctx, point, entity, entityId, target.dataset.handle, target.dataset.index)
      return
    }
    const clamped = clampToBuilding(point, ctx.building, 8)
    if (ctx.tool === 'elevator') {
      const leftCount = ctx.elevators.filter((e) => e.side === 'left').length
      const side = leftCount === 0 ? 'left' : 'right'
      ctx.addElevator({
        side,
        x: clamped.x,
        y: clamped.y,
        width: 56,
        height: 56,
        label: side === 'left' ? 'Elevator L' : 'Elevator R',
        doorSide: null,
      })
      return
    }
    if (ctx.tool === 'exit') {
      const index = ctx.emergencyExits.length + 1
      ctx.addEmergencyExit({ x: clamped.x, y: clamped.y, label: `Exit ${index}` })
      return
    }
    if (!ctx.floor) return
    if (ctx.tool === 'corridor') {
      ctx.addCorridorPoint(clamped)
      return
    }
    if (ctx.tool === 'room' || ctx.tool === 'open' || ctx.tool === 'wc_male' || ctx.tool === 'wc_female') {
      ctx.setDrag({ kind: 'room-create', roomKind: ctx.tool, start: clamped, current: clamped })
      return
    }
    if (ctx.tool === 'wall') {
      ctx.setDrag({ kind: 'wall-create', start: clamped, current: clamped })
      return
    }
    if (ctx.tool === 'passage') {
      ctx.setDrag({ kind: 'passage-create', start: clamped, current: clamped })
      return
    }
    if (ctx.tool === 'qr') {
      const index = ctx.floor.qrMarkers.length + 1
      ctx.addQrMarker({ label: `QR ${ctx.floor.name}-${index}`, x: clamped.x, y: clamped.y })
    }
  }
}
