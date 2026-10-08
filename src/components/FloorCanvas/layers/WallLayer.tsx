import type { Wall } from '../../../types'
import type { CampusStore } from '../../../store/useCampusStore'
import { boxHandles } from '../canvasUtils'
import { ResizeHandles } from './ResizeHandles'

type WallLayerProps = {
  walls: Wall[]
  selected: CampusStore['selected']
}

export function WallLayer({ walls, selected }: WallLayerProps) {
  return walls.map((wall) => {
    const isSelected = selected?.type === 'wall' && selected.id === wall.id
    const handles = boxHandles(wall)
    return (
      <g key={wall.id}>
        <rect
          x={wall.x}
          y={wall.y}
          width={wall.width}
          height={wall.height}
          fill={isSelected ? '#4a5560' : '#2b333b'}
          stroke={isSelected ? '#c45c26' : '#1c2d26'}
          strokeWidth={isSelected ? 3 : 1}
          data-entity="wall"
          data-id={wall.id}
        />
        {isSelected ? (
          <ResizeHandles
            handles={handles}
            entityId={wall.id}
            handleEntity="wall-handle"
            deleteEntity="wall-delete"
            deleteAt={{ x: wall.x + wall.width + 4, y: wall.y - 4 }}
          />
        ) : null}
      </g>
    )
  })
}
