import type { Point, RoomKind } from '../../types'
import type { CampusStore } from '../../store/useCampusStore'

export type FloorCanvasProps = {
  store: CampusStore
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

export type DragState =
  | { kind: 'room-create'; roomKind: RoomKind; start: Point; current: Point }
  | { kind: 'wall-create'; start: Point; current: Point }
  | { kind: 'passage-create'; start: Point; current: Point }
  | { kind: 'room-move'; id: string; offset: Point }
  | { kind: 'wall-move'; id: string; offset: Point }
  | { kind: 'passage-move'; id: string; offset: Point }
  | {
      kind: 'room-resize'
      id: string
      handle: ResizeHandle
      start: Point
      origin: { x: number; y: number; width: number; height: number }
    }
  | {
      kind: 'wall-resize'
      id: string
      handle: ResizeHandle
      start: Point
      origin: { x: number; y: number; width: number; height: number }
    }
  | {
      kind: 'passage-resize'
      id: string
      handle: ResizeHandle
      start: Point
      origin: { x: number; y: number; width: number; height: number }
    }
  | { kind: 'elevator-move'; id: string; offset: Point }
  | {
      kind: 'elevator-resize'
      id: string
      handle: ResizeHandle
      start: Point
      origin: { x: number; y: number; width: number; height: number }
    }
  | { kind: 'exit-move'; id: string; offset: Point }
  | { kind: 'yard-door-move'; id: string; offset: Point }
  | { kind: 'room-door-move'; id: string }
  | { kind: 'qr-move'; id: string; offset: Point }
  | { kind: 'corridor-point'; index: number }
  | { kind: 'divider' }
  | null

export type YardCue = {
  band: { x: number; y: number; width: number; height: number }
  labelX: number
  labelY: number
  arrow: string
}
