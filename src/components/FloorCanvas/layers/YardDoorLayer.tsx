import type { YardDoor } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'

type YardDoorLayerProps = {
  yardDoors: YardDoor[]
  selected: CampusStore['selected']
}

export function YardDoorLayer({ yardDoors, selected }: YardDoorLayerProps) {
  return yardDoors.map((door) => {
    const isSelected =
      selected?.type === 'yard-door' && selected.id === door.id
    return (
      <g key={door.id} transform={`translate(${door.x}, ${door.y})`}>
        <rect
          x={-32}
          y={-24}
          width={64}
          height={48}
          rx="8"
          fill={isSelected ? '#dce9ff' : '#e8f0ff'}
          stroke={isSelected ? '#c45c26' : '#3b6ea5'}
          strokeWidth={isSelected ? 3 : 2}
          data-entity="yard-door"
          data-id={door.id}
        />
        <text
          y={-2}
          textAnchor="middle"
          className="exit-label"
          data-entity="yard-door"
          data-id={door.id}
          style={{ fill: '#1c3d66' }}
        >
          YARD
        </text>
        <text
          y={14}
          textAnchor="middle"
          className="exit-caption"
          data-entity="yard-door"
          data-id={door.id}
          style={{ fill: '#3b6ea5' }}
        >
          {door.label}
        </text>
        {isSelected ? (
          <g
            transform="translate(40, -32)"
            data-entity="yard-door-delete"
            data-id={door.id}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r="12"
              fill="#9b2c2c"
              stroke="#fff"
              strokeWidth="2"
              data-entity="yard-door-delete"
              data-id={door.id}
            />
            <text
              y="4"
              textAnchor="middle"
              className="room-delete-x"
              data-entity="yard-door-delete"
              data-id={door.id}
            >
              ×
            </text>
          </g>
        ) : null}
      </g>
    )
  })
}
