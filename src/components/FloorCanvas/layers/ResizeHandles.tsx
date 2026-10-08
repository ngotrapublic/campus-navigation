import { HANDLE_SIZE, handleCursor } from '../canvasUtils'
import type { ResizeHandle } from '../types'

type ResizeHandlesProps = {
  handles: { id: ResizeHandle; cx: number; cy: number }[]
  entityId: string
  handleEntity: string
  deleteEntity: string
  deleteAt: { x: number; y: number }
  deleteWrapEntity?: boolean
}

export function ResizeHandles({
  handles,
  entityId,
  handleEntity,
  deleteEntity,
  deleteAt,
  deleteWrapEntity = false,
}: ResizeHandlesProps) {
  return (
    <>
      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.cx - HANDLE_SIZE / 2}
          y={handle.cy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          rx="2"
          fill="#fff"
          stroke="#c45c26"
          strokeWidth="2"
          data-entity={handleEntity}
          data-id={entityId}
          data-handle={handle.id}
          style={{ cursor: handleCursor(handle.id) }}
        />
      ))}
      <g
        transform={`translate(${deleteAt.x}, ${deleteAt.y})`}
        style={{ cursor: 'pointer' }}
        {...(deleteWrapEntity
          ? { 'data-entity': deleteEntity, 'data-id': entityId }
          : {})}
      >
        <circle
          r="12"
          fill="#9b2c2c"
          stroke="#fff"
          strokeWidth="2"
          data-entity={deleteEntity}
          data-id={entityId}
        />
        <text
          y="4"
          textAnchor="middle"
          className="room-delete-x"
          data-entity={deleteEntity}
          data-id={entityId}
        >
          ×
        </text>
      </g>
    </>
  )
}
