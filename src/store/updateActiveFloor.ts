import type { AppState, Floor } from '../types'

export function updateActiveFloor(
  state: AppState,
  updater: (floor: Floor) => Floor,
): AppState {
  if (!state.activeBuildingId || !state.activeFloorId) {
    return state
  }

  return {
    ...state,
    buildings: state.buildings.map((building) => {
      if (building.id !== state.activeBuildingId) {
        return building
      }
      return {
        ...building,
        floors: building.floors.map((floor) =>
          floor.id === state.activeFloorId ? updater(floor) : floor,
        ),
      }
    }),
  }
}
