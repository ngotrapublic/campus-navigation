import type { DragState } from '../types'
import { roomFill } from '../../../lib/rooms'

type DraftBoxLayerProps = {
  drag: DragState
}

export function DraftCreateBox({ drag }: DraftBoxLayerProps) {
  const draftBox =
    drag?.kind === 'wall-create' || drag?.kind === 'passage-create'
      ? {
          kind: drag.kind,
          x: Math.min(drag.start.x, drag.current.x),
          y: Math.min(drag.start.y, drag.current.y),
          width: Math.abs(drag.current.x - drag.start.x),
          height: Math.abs(drag.current.y - drag.start.y),
        }
      : null
  if (!draftBox) {
    return null
  }
  return (
    <rect
      x={draftBox.x}
      y={draftBox.y}
      width={draftBox.width}
      height={draftBox.height}
      fill={
        draftBox.kind === 'passage-create'
          ? 'rgba(231, 239, 216, 0.7)'
          : 'rgba(43, 51, 59, 0.55)'
      }
      stroke="#c45c26"
      strokeWidth="2"
      strokeDasharray="6 4"
    />
  )
}

export function DraftCreateRoom({ drag }: DraftBoxLayerProps) {
  const draftRoom =
    drag?.kind === 'room-create'
      ? {
          kind: drag.roomKind,
          x: Math.min(drag.start.x, drag.current.x),
          y: Math.min(drag.start.y, drag.current.y),
          width: Math.abs(drag.current.x - drag.start.x),
          height: Math.abs(drag.current.y - drag.start.y),
        }
      : null
  if (!draftRoom) {
    return null
  }
  return (
    <rect
      x={draftRoom.x}
      y={draftRoom.y}
      width={draftRoom.width}
      height={draftRoom.height}
      rx="8"
      fill={roomFill(draftRoom.kind, false)}
      stroke="#c45c26"
      strokeWidth="2"
      strokeDasharray="6 4"
      opacity="0.8"
    />
  )
}
