import { createId } from '../../lib/id'
import type { EmergencyExit } from '../../types'
import type { ActionDeps } from '../actionDeps'

export function createExitActions(deps: ActionDeps) {
  const { setState, setSelected, setTool } = deps

  function addEmergencyExit(exit: Omit<EmergencyExit, 'id'>) {
    const id = createId('exit')
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          emergencyExits: [...(building.emergencyExits ?? []), { ...exit, id }],
        }
      }),
    }))
    setSelected({ type: 'exit', id })
    setTool('select')
  }

  function updateEmergencyExit(
    exitId: string,
    patch: Partial<EmergencyExit>,
  ) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return {
          ...building,
          emergencyExits: (building.emergencyExits ?? []).map((exit) =>
            exit.id === exitId ? { ...exit, ...patch } : exit,
          ),
        }
      }),
    }))
  }

  return { addEmergencyExit, updateEmergencyExit }
}
