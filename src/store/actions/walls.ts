import { createId } from '../../lib/id'
import type { Wall } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createWallActions(deps: ActionDeps) {
  const { setState, setSelected, setTool } = deps

  function addWall(wall: Omit<Wall, 'id'>) {
    const id = createId('wall')
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        walls: [...(floor.walls ?? []), { ...wall, id }],
      })),
    )
    setSelected({ type: 'wall', id })
    setTool('select')
  }

  function updateWall(wallId: string, patch: Partial<Wall>) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        walls: (floor.walls ?? []).map((wall) =>
          wall.id === wallId ? { ...wall, ...patch } : wall,
        ),
      })),
    )
  }

  function removeWall(wallId: string) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        walls: (floor.walls ?? []).filter((wall) => wall.id !== wallId),
      })),
    )
    setSelected(null)
  }

  return { addWall, updateWall, removeWall }
}
