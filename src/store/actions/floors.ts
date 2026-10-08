import { createEmptyFloor } from '../../lib/storage'
import type { ActionDeps } from '../actionDeps'

export function createFloorActions(deps: ActionDeps) {
  const { setState, setEditorStage, setSelected, setDraftCorridor, getState } =
    deps

  function addFloor(name: string) {
    const state = getState()
    if (!state.activeBuildingId) {
      return
    }
    const building = state.buildings.find((b) => b.id === state.activeBuildingId)
    const order = building?.floors.length ?? 0
    const floor = createEmptyFloor(name, order)
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) =>
        b.id === prev.activeBuildingId
          ? { ...b, floors: [...b.floors, floor] }
          : b,
      ),
      activeFloorId: floor.id,
    }))
    setEditorStage('interior')
  }

  function renameFloor(floorId: string, name: string) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          floors: building.floors.map((floor) =>
            floor.id === floorId ? { ...floor, name } : floor,
          ),
        }
      }),
    }))
  }

  function moveFloor(floorId: string, direction: 'up' | 'down') {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }

        const floors = [...building.floors].sort((a, b) => a.order - b.order)
        const index = floors.findIndex((floor) => floor.id === floorId)
        if (index < 0) {
          return building
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= floors.length) {
          return building
        }

        const swapped = [...floors]
        const current = swapped[index]
        const neighbor = swapped[targetIndex]
        swapped[index] = neighbor
        swapped[targetIndex] = current

        return {
          ...building,
          floors: swapped.map((floor, order) => ({ ...floor, order })),
        }
      }),
    }))
  }

  function deleteFloor(floorId: string) {
    setState((prev) => {
      const buildings = prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        const floors = building.floors
          .filter((floor) => floor.id !== floorId)
          .sort((a, b) => a.order - b.order)
          .map((floor, order) => ({ ...floor, order }))
        return { ...building, floors }
      })

      const activeBuilding = buildings.find((b) => b.id === prev.activeBuildingId)
      const nextActiveFloorId =
        prev.activeFloorId === floorId
          ? (activeBuilding?.floors[0]?.id ?? null)
          : prev.activeFloorId

      return {
        ...prev,
        buildings,
        activeFloorId: nextActiveFloorId,
      }
    })
    setSelected(null)
    setDraftCorridor([])
  }

  return { addFloor, renameFloor, moveFloor, deleteFloor }
}
