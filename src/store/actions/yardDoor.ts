import { createId } from '../../lib/id'
import type { YardDoor } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createYardDoorActions(deps: ActionDeps) {
  const { setState, setSelected, setTool, getSelected } = deps

  function setYardLinkEnabled(enabled: boolean) {
    setState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((building) => {
        if (building.id !== prev.activeBuildingId) {
          return building
        }
        return { ...building, yardLinkEnabled: enabled }
      }),
    }))
  }

  function addYardDoor(door: Omit<YardDoor, 'id'>) {
    const id = createId('yard')
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        yardDoors: [...(floor.yardDoors ?? []), { ...door, id }],
      })),
    )
    setSelected({ type: 'yard-door', id })
    setTool('select')
  }

  function updateYardDoor(doorId: string, patch: Partial<YardDoor>) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        yardDoors: (floor.yardDoors ?? []).map((door) =>
          door.id === doorId ? { ...door, ...patch } : door,
        ),
      })),
    )
  }

  function removeYardDoor(doorId: string) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        yardDoors: (floor.yardDoors ?? []).filter((door) => door.id !== doorId),
      })),
    )
    const selected = getSelected()
    if (selected?.type === 'yard-door' && selected.id === doorId) {
      setSelected(null)
    }
  }

  return {
    setYardLinkEnabled,
    addYardDoor,
    updateYardDoor,
    removeYardDoor,
  }
}
