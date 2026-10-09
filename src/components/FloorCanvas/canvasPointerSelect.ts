import type { Point } from '../../types'
import { elevatorSize } from '../../lib/elevators'
import type { ResizeHandle } from './types'
import { boxOrigin } from './canvasUtils'
import type { DownContext } from './canvasPointerDown'

function beginBoxResize(
  ctx: DownContext,
  point: Point,
  entityId: string,
  handle: ResizeHandle,
  selectedType: 'room' | 'wall' | 'passage',
  resizeKind: 'room-resize' | 'wall-resize' | 'passage-resize',
  item: { x: number; y: number; width: number; height: number } | undefined,
) {
  if (!item) return
  ctx.setSelected({ type: selectedType, id: entityId })
  ctx.setDrag({
    kind: resizeKind,
    id: entityId,
    handle,
    start: point,
    origin: boxOrigin(item),
  })
}

function beginBoxMove(
  ctx: DownContext,
  point: Point,
  entityId: string,
  selectedType: 'room' | 'wall' | 'passage',
  moveKind: 'room-move' | 'wall-move' | 'passage-move',
  item: { x: number; y: number } | undefined,
) {
  if (!item) return
  ctx.setSelected({ type: selectedType, id: entityId })
  ctx.setDrag({
    kind: moveKind,
    id: entityId,
    offset: { x: point.x - item.x, y: point.y - item.y },
  })
}

export function handleSelectDown(
  ctx: DownContext,
  point: Point,
  entity: string | undefined,
  entityId: string | undefined,
  handle: string | undefined,
  indexStr: string | undefined,
) {
  const { floor } = ctx
  if (!floor) return
  if (entity === 'room-delete' && entityId) return void ctx.removeRoom(entityId)
  if (entity === 'wall-delete' && entityId) return void ctx.removeWall(entityId)
  if (entity === 'passage-delete' && entityId) return void ctx.removePassage(entityId)
  if (entity === 'elevator-delete' && entityId) return void ctx.removeElevator(entityId)
  if (entity === 'yard-door-delete' && entityId) {
    return void ctx.removeYardDoor(entityId)
  }
  const h = handle as ResizeHandle | undefined
  if (entity === 'room-handle' && entityId && h) {
    beginBoxResize(ctx, point, entityId, h, 'room', 'room-resize', floor.rooms.find((r) => r.id === entityId))
    return
  }
  if (entity === 'wall-handle' && entityId && h) {
    beginBoxResize(ctx, point, entityId, h, 'wall', 'wall-resize', (floor.walls ?? []).find((w) => w.id === entityId))
    return
  }
  if (entity === 'passage-handle' && entityId && h) {
    beginBoxResize(ctx, point, entityId, h, 'passage', 'passage-resize', (floor.passages ?? []).find((p) => p.id === entityId))
    return
  }
  if (entity === 'elevator-handle' && entityId && h) {
    const elevator = ctx.elevators.find((item) => item.id === entityId)
    if (!elevator) return
    const size = elevatorSize(elevator)
    ctx.setSelected({ type: 'elevator', id: entityId })
    ctx.setDrag({
      kind: 'elevator-resize',
      id: entityId,
      handle: h,
      start: point,
      origin: {
        x: elevator.x - size.width / 2,
        y: elevator.y - size.height / 2,
        width: size.width,
        height: size.height,
      },
    })
    return
  }
  if (entity === 'room' && entityId) {
    beginBoxMove(ctx, point, entityId, 'room', 'room-move', floor.rooms.find((r) => r.id === entityId))
    return
  }
  if (entity === 'wall' && entityId) {
    beginBoxMove(ctx, point, entityId, 'wall', 'wall-move', (floor.walls ?? []).find((w) => w.id === entityId))
    return
  }
  if (entity === 'passage' && entityId) {
    beginBoxMove(ctx, point, entityId, 'passage', 'passage-move', (floor.passages ?? []).find((p) => p.id === entityId))
    return
  }
  if (entity === 'elevator' && entityId) {
    const elevator = ctx.elevators.find((item) => item.id === entityId)
    if (!elevator) return
    ctx.setSelected({ type: 'elevator', id: entityId })
    ctx.setDrag({
      kind: 'elevator-move',
      id: entityId,
      offset: { x: point.x - elevator.x, y: point.y - elevator.y },
    })
    return
  }
  if (entity === 'exit' && entityId) {
    const exit = ctx.emergencyExits.find((item) => item.id === entityId)
    if (!exit) return
    ctx.setSelected({ type: 'exit', id: entityId })
    ctx.setDrag({
      kind: 'exit-move',
      id: entityId,
      offset: { x: point.x - exit.x, y: point.y - exit.y },
    })
    return
  }
  if (entity === 'yard-door' && entityId) {
    const door = (floor.yardDoors ?? []).find((item) => item.id === entityId)
    if (!door) return
    ctx.setSelected({ type: 'yard-door', id: entityId })
    ctx.setDrag({
      kind: 'yard-door-move',
      id: entityId,
      offset: { x: point.x - door.x, y: point.y - door.y },
    })
    return
  }
  if (entity === 'qr' && entityId) {
    const marker = floor.qrMarkers.find((item) => item.id === entityId)
    if (!marker) return
    ctx.setSelected({ type: 'qr', id: entityId })
    ctx.setDrag({
      kind: 'qr-move',
      id: entityId,
      offset: { x: point.x - marker.x, y: point.y - marker.y },
    })
    return
  }
  if (entity === 'corridor-point' && indexStr) {
    const index = Number(indexStr)
    ctx.setSelected({ type: 'corridor-point', index })
    ctx.setDrag({ kind: 'corridor-point', index })
    return
  }
  ctx.setSelected(null)
}
