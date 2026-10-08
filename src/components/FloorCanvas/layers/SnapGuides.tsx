import type { Rect } from '../../../types'
import type { SnapGuide } from '../../../lib/snap'

type SnapGuidesProps = {
  guides: SnapGuide[]
  building: Rect
}

export function SnapGuides({ guides, building }: SnapGuidesProps) {
  return guides.map((guide, index) =>
    guide.orientation === 'v' ? (
      <line
        key={`snap-v-${index}`}
        x1={guide.position}
        y1={building.y}
        x2={guide.position}
        y2={building.y + building.height}
        stroke="#c45c26"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.85"
        pointerEvents="none"
      />
    ) : (
      <line
        key={`snap-h-${index}`}
        x1={building.x}
        y1={guide.position}
        x2={building.x + building.width}
        y2={guide.position}
        stroke="#c45c26"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.85"
        pointerEvents="none"
      />
    ),
  )
}
