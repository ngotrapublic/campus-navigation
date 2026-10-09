import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createSelectionActions(deps: ActionDeps) {
  const { setState, setSelected, getSelected, getActiveFloor } = deps

  function deleteSelected() {
    const selected = getSelected()
    if (!selected) {
      return
    }

    if (selected.type === 'elevator') {
      setState((prev) => ({
        ...prev,
        buildings: prev.buildings.map((building) => {
          if (building.id !== prev.activeBuildingId) {
            return building
          }
          return {
            ...building,
            elevators: (building.elevators ?? []).filter(
              (elevator) => elevator.id !== selected.id,
            ),
          }
        }),
      }))
      setSelected(null)
      return
    }

    if (selected.type === 'exit') {
      setState((prev) => ({
        ...prev,
        buildings: prev.buildings.map((building) => {
          if (building.id !== prev.activeBuildingId) {
            return building
          }
          return {
            ...building,
            emergencyExits: (building.emergencyExits ?? []).filter(
              (exit) => exit.id !== selected.id,
            ),
          }
        }),
      }))
      setSelected(null)
      return
    }

    const activeFloor = getActiveFloor()
    if (!activeFloor) {
      return
    }

    if (selected.type === 'yard-door') {
      setState((prev) =>
        updateActiveFloor(prev, (floor) => ({
          ...floor,
          yardDoors: (floor.yardDoors ?? []).filter(
            (door) => door.id !== selected.id,
          ),
        })),
      )
      setSelected(null)
      return
    }

    if (selected.type === 'corridor-point') {
      setState((prev) =>
        updateActiveFloor(prev, (floor) => ({
          ...floor,
          corridor: floor.corridor.filter((_, i) => i !== selected.index),
        })),
      )
      setSelected(null)
      return
    }

    setState((prev) =>
      updateActiveFloor(prev, (floor) => {
        if (selected.type === 'room') {
          return {
            ...floor,
            rooms: floor.rooms.filter((room) => room.id !== selected.id),
          }
        }
        if (selected.type === 'wall') {
          return {
            ...floor,
            walls: (floor.walls ?? []).filter((wall) => wall.id !== selected.id),
          }
        }
        if (selected.type === 'passage') {
          return {
            ...floor,
            passages: (floor.passages ?? []).filter(
              (passage) => passage.id !== selected.id,
            ),
          }
        }
        return {
          ...floor,
          qrMarkers: floor.qrMarkers.filter((q) => q.id !== selected.id),
        }
      }),
    )
    setSelected(null)
  }

  return { deleteSelected }
}
