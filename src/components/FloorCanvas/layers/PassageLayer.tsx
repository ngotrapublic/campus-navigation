import type { Passage } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'
import { boxHandles } from '../canvasUtils'
import { ResizeHandles } from './ResizeHandles'

type PassageLayerProps = {
  passages: Passage[]
  selected: CampusStore['selected']
}

export function PassageLayer({ passages, selected }: PassageLayerProps) {
  return passages.map((passage) => {
    const isSelected = selected?.type === 'passage' && selected.id === passage.id
    const handles = boxHandles(passage)
    return (
      <g key={passage.id}>
        <rect
          x={passage.x}
          y={passage.y}
          width={passage.width}
          height={passage.height}
          fill={isSelected ? '#d9e4c7' : '#e7efd8'}
          stroke={isSelected ? '#c45c26' : '#7a9160'}
          strokeWidth={isSelected ? 3 : 1}
          strokeDasharray="6 4"
          data-entity="passage"
          data-id={passage.id}
        />
        <text
          x={passage.x + passage.width / 2}
          y={passage.y + passage.height / 2 + 4}
          textAnchor="middle"
          className="passage-label"
          data-entity="passage"
          data-id={passage.id}
        >
          Passage
        </text>
        {isSelected ? (
          <ResizeHandles
            handles={handles}
            entityId={passage.id}
            handleEntity="passage-handle"
            deleteEntity="passage-delete"
            deleteAt={{ x: passage.x + passage.width + 4, y: passage.y - 4 }}
          />
        ) : null}
      </g>
    )
  })
}
