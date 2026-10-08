import type { Point, Rect } from '../../types'
import type { BuildingSite } from '../../types'
import type { Floor } from '../../types'
import type { Elevator, EmergencyExit } from '../../types'
import type { CampusStore } from '../../store/useCampusStore'
import type { SnapGuide } from '../../lib/snap'
import { yardDirectionLabel, type YardDirection } from '../../lib/site'
import { buildingCenter } from '../../lib/mirror'
import type { DragState, YardCue } from './types'
import { CorridorLayer } from './layers/CorridorLayer'
import { PassageLayer } from './layers/PassageLayer'
import { WallLayer } from './layers/WallLayer'
import { RoomLayer } from './layers/RoomLayer'
import { ElevatorLayer } from './layers/ElevatorLayer'
import { ExitLayer } from './layers/ExitLayer'
import { QrLayer } from './layers/QrLayer'
import { SnapGuides } from './layers/SnapGuides'
import { MidlineLayer } from './layers/MidlineLayer'
import { DraftCreateBox, DraftCreateRoom } from './layers/DraftBoxLayer'

type InteriorStageProps = {
  site: BuildingSite
  building: Rect
  floor: Floor | null
  yardSide: YardDirection
  yardCue: YardCue
  symmetryEnabled: boolean
  symmetryAxis: CampusStore['symmetryAxis']
  corridorPoints: Point[]
  corridorPath: string
  selected: CampusStore['selected']
  elevators: Elevator[]
  emergencyExits: EmergencyExit[]
  snapGuides: SnapGuide[]
  drag: DragState
}

export function InteriorStage(props: InteriorStageProps) {
  const {
    site,
    building,
    floor,
    yardSide,
    yardCue,
    symmetryEnabled,
    symmetryAxis,
    corridorPoints,
    corridorPath,
    selected,
    elevators,
    emergencyExits,
    snapGuides,
    drag,
  } = props
  const center = buildingCenter(building)
  const midlineAxis =
    symmetryEnabled && symmetryAxis ? symmetryAxis : null

  return (
    <>
      <rect
        x={yardCue.band.x}
        y={yardCue.band.y}
        width={yardCue.band.width}
        height={yardCue.band.height}
        rx="8"
        fill="#c8d9b8"
        opacity="0.95"
      />
      <text
        x={yardCue.labelX}
        y={yardCue.labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="yard-cue-label"
        transform={
          yardSide === 'left' || yardSide === 'right'
            ? `rotate(-90 ${yardCue.labelX} ${yardCue.labelY})`
            : undefined
        }
      >
        {yardCue.arrow} Yard
      </text>
      <rect
        x={building.x}
        y={building.y}
        width={building.width}
        height={building.height}
        fill="#e8f0eb"
        stroke="#355e50"
        strokeWidth="3"
      />
      <text
        x={building.x + 16}
        y={yardSide === 'top' ? building.y - 48 : building.y - 14}
        className="plot-caption"
      >
        Building interior · {site.buildingWidthM}×{site.buildingHeightM} m
        {floor ? ` · Floor ${floor.name}` : ''} · {yardDirectionLabel(yardSide)}
      </text>
      <MidlineLayer building={building} center={center} symmetryAxis={midlineAxis} />
      {!floor ? (
        <text
          x={building.x + building.width / 2}
          y={building.y + building.height / 2}
          textAnchor="middle"
          className="zone-label building"
        >
          Add a floor to start drawing
        </text>
      ) : null}
      <CorridorLayer
        corridorPoints={corridorPoints}
        corridorPath={corridorPath}
        selected={selected}
      />
      <PassageLayer passages={floor?.passages ?? []} selected={selected} />
      <WallLayer walls={floor?.walls ?? []} selected={selected} />
      <DraftCreateBox drag={drag} />
      {floor ? <RoomLayer rooms={floor.rooms} selected={selected} /> : null}
      <DraftCreateRoom drag={drag} />
      <SnapGuides guides={snapGuides} building={building} />
      <ElevatorLayer elevators={elevators} selected={selected} />
      <ExitLayer emergencyExits={emergencyExits} selected={selected} />
      {floor ? (
        <QrLayer qrMarkers={floor.qrMarkers} selected={selected} />
      ) : null}
    </>
  )
}
