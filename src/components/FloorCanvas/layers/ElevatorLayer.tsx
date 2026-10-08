import type { Elevator } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'
import { elevatorDoorLocal, elevatorSize } from '../../../lib/elevators'
import { centerBoxHandles } from '../canvasUtils'
import { ResizeHandles } from './ResizeHandles'

type ElevatorLayerProps = {
  elevators: Elevator[]
  selected: CampusStore['selected']
}

export function ElevatorLayer({ elevators, selected }: ElevatorLayerProps) {
  return elevators.map((elevator) => {
    const isSelected =
      selected?.type === 'elevator' && selected.id === elevator.id
    const size = elevatorSize(elevator)
    const halfW = size.width / 2
    const halfH = size.height / 2
    const doorLocal = elevatorDoorLocal(elevator)
    const handles = centerBoxHandles(halfW, halfH)
    return (
      <g key={elevator.id} transform={`translate(${elevator.x}, ${elevator.y})`}>
        <rect
          x={-halfW}
          y={-halfH}
          width={size.width}
          height={size.height}
          rx="10"
          fill={isSelected ? '#ffe8d8' : '#fff4ec'}
          stroke={isSelected ? '#c45c26' : '#9a4d24'}
          strokeWidth={isSelected ? 3 : 2}
          data-entity="elevator"
          data-id={elevator.id}
        />
        <text
          y={4}
          textAnchor="middle"
          className="elev-label"
          data-entity="elevator"
          data-id={elevator.id}
        >
          {elevator.side === 'left' ? 'EL' : 'ER'}
        </text>
        {doorLocal ? (
          <g pointerEvents="none">
            <rect
              x={doorLocal.x - 7}
              y={doorLocal.y - 7}
              width="14"
              height="14"
              rx="2"
              fill="#fff"
              stroke="#c45c26"
              strokeWidth="2"
            />
            <circle cx={doorLocal.x} cy={doorLocal.y} r="3" fill="#c45c26" />
          </g>
        ) : null}
        {isSelected ? (
          <ResizeHandles
            handles={handles}
            entityId={elevator.id}
            handleEntity="elevator-handle"
            deleteEntity="elevator-delete"
            deleteAt={{ x: halfW + 8, y: -halfH - 8 }}
            deleteWrapEntity
          />
        ) : null}
      </g>
    )
  })
}
