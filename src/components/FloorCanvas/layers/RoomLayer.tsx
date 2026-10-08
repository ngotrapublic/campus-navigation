import type { Room } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'
import { roomDoorPoint, roomFill, roomStroke } from '../../../lib/rooms'
import { boxHandles } from '../canvasUtils'
import { ResizeHandles } from './ResizeHandles'

type RoomLayerProps = {
  rooms: Room[]
  selected: CampusStore['selected']
}

export function RoomLayer({ rooms, selected }: RoomLayerProps) {
  return rooms.map((room) => {
    const isSelected = selected?.type === 'room' && selected.id === room.id
    const kind = room.kind ?? 'room'
    const door = roomDoorPoint(room)
    const handles = boxHandles(room)
    return (
      <g key={room.id}>
        <rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          rx="8"
          fill={roomFill(kind, isSelected)}
          stroke={roomStroke(kind, isSelected)}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={kind === 'open' ? '8 5' : undefined}
          data-entity="room"
          data-id={room.id}
        />
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2 - 6}
          textAnchor="middle"
          className="room-label"
          data-entity="room"
          data-id={room.id}
        >
          {room.name}
        </text>
        {room.code ? (
          <text
            x={room.x + room.width / 2}
            y={room.y + room.height / 2 + 14}
            textAnchor="middle"
            className="room-code"
            data-entity="room"
            data-id={room.id}
          >
            {room.code}
          </text>
        ) : null}
        {door ? (
          <g pointerEvents="none">
            <rect
              x={door.x - 7}
              y={door.y - 7}
              width="14"
              height="14"
              rx="2"
              fill="#fff"
              stroke="#c45c26"
              strokeWidth="2"
            />
            <circle cx={door.x} cy={door.y} r="3" fill="#c45c26" />
          </g>
        ) : null}
        {isSelected ? (
          <ResizeHandles
            handles={handles}
            entityId={room.id}
            handleEntity="room-handle"
            deleteEntity="room-delete"
            deleteAt={{ x: room.x + room.width + 4, y: room.y - 4 }}
            deleteWrapEntity
          />
        ) : null}
      </g>
    )
  })
}
