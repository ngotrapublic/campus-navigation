import { normalizeSite } from '../../lib/site'
import { createBuilding } from '../../lib/storage'
import type { ActionDeps } from '../actionDeps'
import type { BuildingSite } from '../../types'

export function createBuildingActions(deps: ActionDeps) {
  const { setState, setEditorStage, setTool, setSelected } = deps

  function addBuilding(name: string, location: string) {
    const building = createBuilding(name, location)
    setState((prev) => ({
      ...prev,
      buildings: [...prev.buildings, building],
      activeBuildingId: building.id,
      activeFloorId: null,
    }))
    setEditorStage('site')
    setTool('select')
    setSelected(null)
  }

  function renameBuilding(buildingId: string, name: string, location: string) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) =>
        building.id === buildingId ? { ...building, name, location } : building,
      ),
    }))
  }

  function updateSite(patch: Partial<BuildingSite>) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          site: normalizeSite({ ...building.site, ...patch }),
        }
      }),
    }))
  }

  return { addBuilding, renameBuilding, updateSite }
}
