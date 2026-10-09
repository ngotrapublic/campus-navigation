import { useEffect, useMemo, useRef, useState } from 'react'
import type { EditorStage, EditorTool, SelectedEntity } from '../types'
import type { Point } from '../types'
import type { SymmetryAxis } from '../lib/mirror'
import { normalizeSite } from '../lib/site'
import { publishCampusState } from '../lib/liveState'
import { loadState, saveState } from '../lib/storage'
import type { ActionDeps } from './actionDeps'
import { createNavigationActions } from './actions/navigation'
import { createBuildingActions } from './actions/buildings'
import { createFloorActions } from './actions/floors'
import { createCorridorActions } from './actions/corridor'
import { createRoomActions } from './actions/rooms'
import { createWallActions } from './actions/walls'
import { createPassageActions } from './actions/passages'
import { createElevatorActions } from './actions/elevators'
import { createExitActions } from './actions/exits'
import { createYardDoorActions } from './actions/yardDoor'
import { createQrActions } from './actions/qr'
import { createSelectionActions } from './actions/selection'
import { createSymmetryActions } from './actions/symmetry'
import { createImportExportActions } from './actions/importExport'

export function useCampusStore() {
  const [state, setState] = useState(() => loadState())
  const [editorStage, setEditorStage] = useState<EditorStage>('site')
  const [tool, setTool] = useState<EditorTool>('select')
  const [selected, setSelected] = useState<SelectedEntity>(null)
  const [draftCorridor, setDraftCorridor] = useState<Point[]>([])
  const [symmetryEnabled, setSymmetryEnabled] = useState(false)
  const [symmetryAxis, setSymmetryAxis] = useState<SymmetryAxis>('vertical')

  const stateRef = useRef(state)
  stateRef.current = state
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const draftCorridorRef = useRef(draftCorridor)
  draftCorridorRef.current = draftCorridor
  const symmetryAxisRef = useRef(symmetryAxis)
  symmetryAxisRef.current = symmetryAxis

  useEffect(() => {
    saveState(state)
    void publishCampusState(state)
  }, [state])

  const activeBuilding = useMemo(() => {
    const building =
      state.buildings.find((b) => b.id === state.activeBuildingId) ?? null
    if (!building) {
      return null
    }
    return {
      ...building,
      site: normalizeSite(building.site),
      elevators: building.elevators ?? [],
      emergencyExits: building.emergencyExits ?? [],
      yardLinkEnabled: Boolean(building.yardLinkEnabled),
    }
  }, [state.buildings, state.activeBuildingId])

  const activeFloor = useMemo(
    () =>
      activeBuilding?.floors.find((f) => f.id === state.activeFloorId) ?? null,
    [activeBuilding, state.activeFloorId],
  )

  const activeFloorRef = useRef(activeFloor)
  activeFloorRef.current = activeFloor

  const deps: ActionDeps = {
    setState,
    setEditorStage,
    setTool,
    setSelected,
    setDraftCorridor,
    getState: () => stateRef.current,
    getSelected: () => selectedRef.current,
    getActiveFloor: () => activeFloorRef.current,
    getSymmetryAxis: () => symmetryAxisRef.current,
    getDraftCorridor: () => draftCorridorRef.current,
  }

  const navigation = createNavigationActions(deps)
  const buildings = createBuildingActions(deps)
  const floors = createFloorActions(deps)
  const corridor = createCorridorActions(deps)
  const rooms = createRoomActions(deps)
  const walls = createWallActions(deps)
  const passages = createPassageActions(deps)
  const elevators = createElevatorActions(deps)
  const exits = createExitActions(deps)
  const yardDoor = createYardDoorActions(deps)
  const qr = createQrActions(deps)
  const selection = createSelectionActions(deps)
  const symmetry = createSymmetryActions(deps)
  const importExport = createImportExportActions(deps)

  return {
    state,
    editorStage,
    tool,
    setTool,
    selected,
    setSelected,
    draftCorridor,
    setDraftCorridor,
    symmetryEnabled,
    setSymmetryEnabled,
    symmetryAxis,
    setSymmetryAxis,
    mirrorActiveFloor: symmetry.mirrorActiveFloor,
    activeBuilding,
    activeFloor,
    setBaseUrl: navigation.setBaseUrl,
    selectBuilding: navigation.selectBuilding,
    selectFloor: navigation.selectFloor,
    enterInterior: navigation.enterInterior,
    backToSite: navigation.backToSite,
    addBuilding: buildings.addBuilding,
    renameBuilding: buildings.renameBuilding,
    updateSite: buildings.updateSite,
    addFloor: floors.addFloor,
    renameFloor: floors.renameFloor,
    moveFloor: floors.moveFloor,
    deleteFloor: floors.deleteFloor,
    insertUCorridor: corridor.insertUCorridor,
    clearCorridor: corridor.clearCorridor,
    commitDraftCorridor: corridor.commitDraftCorridor,
    addCorridorPoint: corridor.addCorridorPoint,
    moveCorridorPoint: corridor.moveCorridorPoint,
    addRoom: rooms.addRoom,
    updateRoom: rooms.updateRoom,
    removeRoom: rooms.removeRoom,
    addWall: walls.addWall,
    updateWall: walls.updateWall,
    removeWall: walls.removeWall,
    addPassage: passages.addPassage,
    updatePassage: passages.updatePassage,
    removePassage: passages.removePassage,
    addElevator: elevators.addElevator,
    updateElevator: elevators.updateElevator,
    removeElevator: elevators.removeElevator,
    addEmergencyExit: exits.addEmergencyExit,
    updateEmergencyExit: exits.updateEmergencyExit,
    setYardLinkEnabled: yardDoor.setYardLinkEnabled,
    addYardDoor: yardDoor.addYardDoor,
    updateYardDoor: yardDoor.updateYardDoor,
    removeYardDoor: yardDoor.removeYardDoor,
    addQrMarker: qr.addQrMarker,
    updateQrMarker: qr.updateQrMarker,
    deleteSelected: selection.deleteSelected,
    downloadExport: importExport.downloadExport,
    uploadImport: importExport.uploadImport,
  }
}

export type CampusStore = ReturnType<typeof useCampusStore>
export type { Building, Floor } from '../types'
