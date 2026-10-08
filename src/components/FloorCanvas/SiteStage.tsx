import type { BuildingSite } from '../../types'
import {
  buildingRect,
  dividerLine,
  formatArea,
  plotSizeM,
  siteAreas,
  sitePlotRect,
  yardRect,
} from '../../lib/site'

type SiteStageProps = {
  site: BuildingSite
}

export function SiteStage({ site }: SiteStageProps) {
  const plot = sitePlotRect(site)
  const plotM = plotSizeM(site)
  const yard = yardRect(site)
  const building = buildingRect(site)
  const divider = dividerLine(site)
  const areas = siteAreas(site)
  const dividerCursor =
    site.splitAxis === 'horizontal' ? 'row-resize' : 'col-resize'

  return (
    <>
      <rect
        x={plot.x}
        y={plot.y}
        width={plot.width}
        height={plot.height}
        fill="none"
        stroke="#1c2d26"
        strokeWidth="2"
        rx="4"
      />
      <rect
        x={yard.x}
        y={yard.y}
        width={yard.width}
        height={yard.height}
        fill="#c8d9b8"
        opacity="0.85"
      />
      <text
        x={yard.x + yard.width / 2}
        y={yard.y + yard.height / 2}
        textAnchor="middle"
        className="zone-label"
      >
        Yard · {formatArea(areas.yardM2)}
      </text>
      <rect
        x={building.x}
        y={building.y}
        width={building.width}
        height={building.height}
        fill="#e8f0eb"
        stroke="#355e50"
        strokeWidth="2"
      />
      <text
        x={building.x + building.width / 2}
        y={building.y + building.height / 2}
        textAnchor="middle"
        className="zone-label building"
      >
        Building · {formatArea(areas.buildingM2)}
      </text>
      <line
        x1={divider.x1}
        y1={divider.y1}
        x2={divider.x2}
        y2={divider.y2}
        stroke="#c45c26"
        strokeWidth="4"
        strokeLinecap="round"
        data-entity="divider"
        style={{ cursor: dividerCursor }}
      />
      <line
        x1={divider.x1}
        y1={divider.y1}
        x2={divider.x2}
        y2={divider.y2}
        stroke="transparent"
        strokeWidth="16"
        data-entity="divider"
        style={{ cursor: dividerCursor }}
      />
      <text x={plot.x + 12} y={plot.y - 12} className="plot-caption">
        Plot {plotM.widthM} × {plotM.heightM} m · {formatArea(areas.totalM2)}
      </text>
    </>
  )
}
