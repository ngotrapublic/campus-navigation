import type { CampusStore } from '../../store/useCampusStore'
import { siteScale } from '../../lib/site'
import { RoomProperties } from './RoomProperties'
import { WallProperties } from './WallProperties'
import { PassageProperties } from './PassageProperties'
import { ElevatorProperties } from './ElevatorProperties'
import { ExitProperties } from './ExitProperties'
import { QrProperties } from './QrProperties'
import { FloorSummary } from './FloorSummary'
import { useSelectedEntities } from './useSelectedEntities'
import { useQrPreview } from './useQrPreview'

type PropertiesPanelProps = {
  store: CampusStore
}

export function PropertiesPanel({ store }: PropertiesPanelProps) {
  const {
    state,
    editorStage,
    selected,
    activeBuilding,
    activeFloor,
    updateRoom,
    removeRoom,
    updateWall,
    removeWall,
    updatePassage,
    removePassage,
    updateElevator,
    removeElevator,
    updateEmergencyExit,
    updateQrMarker,
  } = store

  const {
    selectedRoom,
    selectedWall,
    selectedPassage,
    selectedElevator,
    selectedExit,
    selectedQr,
  } = useSelectedEntities(store)

  const metersToPx = activeBuilding ? siteScale(activeBuilding.site) : 1

  const { qrDataUrl, qrUrl, printQr } = useQrPreview(
    selectedQr,
    activeBuilding,
    activeFloor,
    state.settings.baseUrl,
  )

  if (editorStage === 'site') {
    return (
      <aside className="properties">
        <h2>Site</h2>
        <p className="muted">
          Adjust yard and building sizes on the left, then enter the building to add
          floors.
        </p>
      </aside>
    )
  }

  return (
    <aside className="properties">
      <h2>Properties</h2>

      {!selected ? (
        <p className="muted">
          Select a room, wall, passage, elevator, exit, QR point, or corridor
          handle to edit.
        </p>
      ) : null}

      {selected?.type === 'corridor-point' ? (
        <div className="stack">
          <p>
            Corridor point <strong>#{selected.index + 1}</strong>
          </p>
          <p className="hint">Drag the handle on the map to reshape the U corridor.</p>
        </div>
      ) : null}

      {selectedRoom ? (
        <RoomProperties
          selectedRoom={selectedRoom}
          metersToPx={metersToPx}
          activeFloorName={activeFloor?.name}
          updateRoom={updateRoom}
          removeRoom={removeRoom}
        />
      ) : null}

      {selectedWall ? (
        <WallProperties
          selectedWall={selectedWall}
          metersToPx={metersToPx}
          updateWall={updateWall}
          removeWall={removeWall}
        />
      ) : null}

      {selectedPassage ? (
        <PassageProperties
          selectedPassage={selectedPassage}
          metersToPx={metersToPx}
          updatePassage={updatePassage}
          removePassage={removePassage}
        />
      ) : null}

      {selectedElevator ? (
        <ElevatorProperties
          selectedElevator={selectedElevator}
          metersToPx={metersToPx}
          updateElevator={updateElevator}
          removeElevator={removeElevator}
        />
      ) : null}

      {selectedExit ? (
        <ExitProperties
          selectedExit={selectedExit}
          updateEmergencyExit={updateEmergencyExit}
        />
      ) : null}

      {selectedQr ? (
        <QrProperties
          selectedQr={selectedQr}
          qrDataUrl={qrDataUrl}
          qrUrl={qrUrl}
          updateQrMarker={updateQrMarker}
          onPrintQr={printQr}
        />
      ) : null}

      {activeFloor ? (
        <FloorSummary activeFloor={activeFloor} activeBuilding={activeBuilding} />
      ) : null}
    </aside>
  )
}
