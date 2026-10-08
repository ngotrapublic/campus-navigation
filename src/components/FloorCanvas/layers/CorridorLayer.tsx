import type { Point } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'

type CorridorLayerProps = {
  corridorPoints: Point[]
  corridorPath: string
  selected: CampusStore['selected']
}

export function CorridorLayer({
  corridorPoints,
  corridorPath,
  selected,
}: CorridorLayerProps) {
  return (
    <>
      {corridorPath ? (
        <path
          d={corridorPath}
          fill="none"
          stroke="#2f6f5e"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
      ) : null}
      {corridorPath ? (
        <path
          d={corridorPath}
          fill="none"
          stroke="#1f4f43"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 8"
        />
      ) : null}
      {corridorPoints.map((point, index) => {
        const isSelected =
          selected?.type === 'corridor-point' && selected.index === index
        return (
          <circle
            key={`c-${index}`}
            cx={point.x}
            cy={point.y}
            r={isSelected ? 9 : 7}
            fill={isSelected ? '#c45c26' : '#1f4f43'}
            stroke="#fff"
            strokeWidth="2"
            data-entity="corridor-point"
            data-index={index}
          />
        )
      })}
    </>
  )
}
