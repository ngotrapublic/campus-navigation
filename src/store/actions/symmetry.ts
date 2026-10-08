import {
  mirrorEmergencyExits,
  mirrorElevators,
  mirrorFloorContent,
} from '../../lib/mirror'
import { buildingRect, normalizeSite } from '../../lib/site'
import type { ActionDeps } from '../actionDeps'

export function createSymmetryActions(deps: ActionDeps) {
  const { setState, setSelected, getState, getSymmetryAxis } = deps

  function mirrorActiveFloor() {
    const state = getState()
    if (!state.activeBuildingId || !state.activeFloorId) {
      return
    }
    const building = state.buildings.find((b) => b.id === state.activeBuildingId)
    if (!building) {
      return
    }
    const symmetryAxis = getSymmetryAxis()
    const bounds = buildingRect(normalizeSite(building.site))
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((item) => {
        if (item.id !== prev.activeBuildingId) {
          return item
        }
        return {
          ...item,
          elevators: mirrorElevators(
            item.elevators ?? [],
            bounds,
            symmetryAxis,
          ),
          emergencyExits: mirrorEmergencyExits(
            item.emergencyExits ?? [],
            bounds,
            symmetryAxis,
          ),
          floors: item.floors.map((floor) =>
            floor.id === prev.activeFloorId
              ? mirrorFloorContent(floor, bounds, symmetryAxis)
              : floor,
          ),
        }
      }),
    }))
    setSelected(null)
  }

  return { mirrorActiveFloor }
}
