import { createId } from '../../lib/id'
import type { Elevator } from '../../types'
import type { ActionDeps } from '../actionDeps'

export function createElevatorActions(deps: ActionDeps) {
  const { setState, setSelected, setTool, getSelected } = deps

  function addElevator(elevator: Omit<Elevator, 'id'>) {
    const id = createId('elev')
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          elevators: [...(building.elevators ?? []), { ...elevator, id }],
        }
      }),
    }))
    setSelected({ type: 'elevator', id })
    setTool('select')
  }

  function updateElevator(elevatorId: string, patch: Partial<Elevator>) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          elevators: (building.elevators ?? []).map((elevator) =>
            elevator.id === elevatorId ? { ...elevator, ...patch } : elevator,
          ),
        }
      }),
    }))
  }

  function removeElevator(elevatorId: string) {
    const selected = getSelected()
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          elevators: (building.elevators ?? []).filter(
            (elevator) => elevator.id !== elevatorId,
          ),
        }
      }),
    }))
    if (selected?.type === 'elevator' && selected.id === elevatorId) {
      setSelected(null)
    }
  }

  return { addElevator, updateElevator, removeElevator }
}
