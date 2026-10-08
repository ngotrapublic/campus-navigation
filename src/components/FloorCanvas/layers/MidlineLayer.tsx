import type { Rect } from '../../../types'

type MidlineLayerProps = {
  building: Rect
  center: { cx: number; cy: number }
  symmetryAxis: 'vertical' | 'horizontal' | null
}

export function MidlineLayer({ building, center, symmetryAxis }: MidlineLayerProps) {
  if (symmetryAxis === 'vertical') {
    return (
      <g>
        <line
          x1={center.cx}
          y1={building.y}
          x2={center.cx}
          y2={building.y + building.height}
          stroke="#6b5cff"
          strokeWidth="2"
          strokeDasharray="8 6"
          pointerEvents="none"
        />
        <text x={center.cx + 8} y={building.y + 18} className="midline-label">
          Midline
        </text>
      </g>
    )
  }
  if (symmetryAxis === 'horizontal') {
    return (
      <g>
        <line
          x1={building.x}
          y1={center.cy}
          x2={building.x + building.width}
          y2={center.cy}
          stroke="#6b5cff"
          strokeWidth="2"
          strokeDasharray="8 6"
          pointerEvents="none"
        />
        <text x={building.x + 8} y={center.cy - 8} className="midline-label">
          Midline
        </text>
      </g>
    )
  }
  return null
}
