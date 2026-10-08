import type { Building, Floor, Point } from '../../types'
import { elevatorSize } from '../../lib/elevators'
import { roomFill, roomStroke } from '../../lib/rooms'
import { pathD } from './pathD'

type GoMapProps = {
  bounds: { x: number; y: number; width: number; height: number }
  building: Building
  viewFloor: Floor | null
  legPoints: Point[]
  startFloor: Floor
  startPoint: Point
}

export function GoMap({
  bounds,
  building,
  viewFloor,
  legPoints,
  startFloor,
  startPoint,
}: GoMapProps) {
  return (
    <div className="go-map-wrap">
      <svg
        className="go-map"
        viewBox={`${bounds.x - 20} ${bounds.y - 20} ${bounds.width + 40} ${bounds.height + 40}`}
      >
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          fill="#f4f7f5"
          stroke="#2b333b"
          strokeWidth="2"
        />
        {(viewFloor?.passages ?? []).map((passage) => (
          <rect
            key={passage.id}
            x={passage.x}
            y={passage.y}
            width={passage.width}
            height={passage.height}
            fill="rgba(180, 200, 210, 0.35)"
            stroke="none"
          />
        ))}
        {(viewFloor?.walls ?? []).map((wall) => (
          <rect
            key={wall.id}
            x={wall.x}
            y={wall.y}
            width={wall.width}
            height={wall.height}
            fill="#2b333b"
          />
        ))}
        {(viewFloor?.rooms ?? []).map((room) => (
          <g key={room.id}>
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              rx="6"
              fill={roomFill(room.kind ?? 'room', false)}
              stroke={roomStroke(room.kind ?? 'room', false)}
              strokeWidth="1.5"
              strokeDasharray={room.kind === 'open' ? '6 4' : undefined}
            />
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              className="go-room-label"
            >
              {room.name}
            </text>
          </g>
        ))}
        {(viewFloor?.corridor?.length ?? 0) >= 2 ? (
          <path
            d={pathD(viewFloor!.corridor)}
            fill="none"
            stroke="#9aa7a0"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        ) : null}
        {(building.elevators ?? []).map((elevator) => {
          const size = elevatorSize(elevator)
          return (
            <rect
              key={elevator.id}
              x={elevator.x - size.width / 2}
              y={elevator.y - size.height / 2}
              width={size.width}
              height={size.height}
              rx="8"
              fill="#fff4ec"
              stroke="#9a4d24"
              strokeWidth="2"
            />
          )
        })}
        {legPoints.length >= 2 ? (
          <path
            d={pathD(legPoints)}
            fill="none"
            stroke="#c45c26"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <circle
          cx={
            viewFloor?.id === startFloor.id
              ? startPoint.x
              : (legPoints[0]?.x ?? startPoint.x)
          }
          cy={
            viewFloor?.id === startFloor.id
              ? startPoint.y
              : (legPoints[0]?.y ?? startPoint.y)
          }
          r="10"
          fill="#1f7a45"
          stroke="#fff"
          strokeWidth="3"
        />
        {legPoints.length > 0 ? (
          <circle
            cx={legPoints[legPoints.length - 1].x}
            cy={legPoints[legPoints.length - 1].y}
            r="10"
            fill="#c45c26"
            stroke="#fff"
            strokeWidth="3"
          />
        ) : null}
      </svg>
    </div>
  )
}
