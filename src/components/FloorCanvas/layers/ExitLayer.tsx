import type { EmergencyExit } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'

type ExitLayerProps = {
  emergencyExits: EmergencyExit[]
  selected: CampusStore['selected']
}

export function ExitLayer({ emergencyExits, selected }: ExitLayerProps) {
  return emergencyExits.map((exit) => {
    const isSelected = selected?.type === 'exit' && selected.id === exit.id
    return (
      <g key={exit.id} transform={`translate(${exit.x}, ${exit.y})`}>
        <rect
          x={-30}
          y={-22}
          width={60}
          height={44}
          rx="6"
          fill={isSelected ? '#1f7a45' : '#228b4e'}
          stroke={isSelected ? '#c45c26' : '#145c34'}
          strokeWidth={isSelected ? 3 : 2}
          data-entity="exit"
          data-id={exit.id}
        />
        <text
          y={-2}
          textAnchor="middle"
          className="exit-label"
          data-entity="exit"
          data-id={exit.id}
        >
          EXIT
        </text>
        <text
          y={14}
          textAnchor="middle"
          className="exit-caption"
          data-entity="exit"
          data-id={exit.id}
        >
          {exit.label}
        </text>
      </g>
    )
  })
}
