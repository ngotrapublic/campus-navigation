import type { ActionDeps } from '../actionDeps'

export function createNavigationActions(deps: ActionDeps) {
  const {
    setState,
    setEditorStage,
    setTool,
    setSelected,
    setDraftCorridor,
    getState,
  } = deps

  function setBaseUrl(baseUrl: string) {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, baseUrl },
    }))
  }

  function selectBuilding(buildingId: string) {
    const state = getState()
    const building = state.buildings.find((b) => b.id === buildingId)
    const firstFloor = building
      ? [...building.floors].sort((a, b) => a.order - b.order)[0]
      : null
    setState((prev) => ({
      ...prev,
      activeBuildingId: buildingId,
      activeFloorId: firstFloor?.id ?? null,
    }))
    setEditorStage('site')
    setTool('select')
    setSelected(null)
    setDraftCorridor([])
  }

  function selectFloor(floorId: string) {
    setState((prev) => ({ ...prev, activeFloorId: floorId }))
    setEditorStage('interior')
    setSelected(null)
    setDraftCorridor([])
  }

  function enterInterior() {
    setEditorStage('interior')
    setTool('select')
    setSelected(null)
    setDraftCorridor([])
  }

  function backToSite() {
    setEditorStage('site')
    setTool('select')
    setSelected(null)
    setDraftCorridor([])
  }

  return {
    setBaseUrl,
    selectBuilding,
    selectFloor,
    enterInterior,
    backToSite,
  }
}
