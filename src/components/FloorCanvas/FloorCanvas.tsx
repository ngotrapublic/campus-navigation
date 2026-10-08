import { useRef } from 'react'
import type { Building } from '../../types'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../types'
import {
  buildingRect,
  interiorViewBox,
  yardDirection,
} from '../../lib/site'
import { yardCueFromSide } from './canvasUtils'
import { useCanvasPointer } from './useCanvasPointer'
import { SiteStage } from './SiteStage'
import { InteriorStage } from './InteriorStage'
import type { FloorCanvasProps } from './types'
import type { CampusStore } from '../../store/useCampusStore'

function FloorCanvasView({
  store,
  currentBuilding,
}: {
  store: CampusStore
  currentBuilding: Building
}) {
  const {
    editorStage,
    tool,
    activeFloor,
    draftCorridor,
    symmetryEnabled,
    symmetryAxis,
  } = store

  const svgRef = useRef<SVGSVGElement>(null)
  const site = currentBuilding.site
  const building = buildingRect(site)
  const yardSide = yardDirection(site)
  const floor = activeFloor
  const elevators = currentBuilding.elevators ?? []
  const emergencyExits = currentBuilding.emergencyExits ?? []
  const isInterior = editorStage === 'interior'
  const yardCue = yardCueFromSide(yardSide, building)

  const view = isInterior
    ? interiorViewBox(site)
    : { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }

  const corridorPoints =
    isInterior && floor && tool === 'corridor' && draftCorridor.length > 0
      ? draftCorridor
      : isInterior
        ? (floor?.corridor ?? [])
        : []

  const corridorPath = corridorPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const {
    drag,
    snapGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCanvasPointer({
    store,
    svgRef,
    view,
    isInterior,
    site,
    building,
    floor,
    elevators,
    emergencyExits,
  })

  return (
    <div className="canvas-shell">
      <svg
        ref={svgRef}
        className={`floor-canvas tool-${isInterior ? tool : 'select'} stage-${editorStage}`}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(28, 45, 38, 0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          x={view.x}
          y={view.y}
          width={view.width}
          height={view.height}
          fill="#f3f6f2"
        />
        <rect
          x={view.x}
          y={view.y}
          width={view.width}
          height={view.height}
          fill="url(#grid)"
        />
        {!isInterior ? (
          <SiteStage site={site} />
        ) : (
          <InteriorStage
            site={site}
            building={building}
            floor={floor}
            yardSide={yardSide}
            yardCue={yardCue}
            symmetryEnabled={symmetryEnabled}
            symmetryAxis={symmetryAxis}
            corridorPoints={corridorPoints}
            corridorPath={corridorPath}
            selected={store.selected}
            elevators={elevators}
            emergencyExits={emergencyExits}
            snapGuides={snapGuides}
            drag={drag}
          />
        )}
      </svg>
    </div>
  )
}

export function FloorCanvas({ store }: FloorCanvasProps) {
  const { activeBuilding } = store
  if (!activeBuilding) {
    return (
      <div className="canvas-empty">Select or create a building to set up the site.</div>
    )
  }
  return <FloorCanvasView store={store} currentBuilding={activeBuilding} />
}
