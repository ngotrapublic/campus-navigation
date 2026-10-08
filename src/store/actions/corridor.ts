import { createMildUCorridor } from '../../lib/geometry'
import { buildingRect } from '../../lib/site'
import type { Point } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createCorridorActions(deps: ActionDeps) {
  const { setState, setTool, setDraftCorridor, getState } = deps

  function insertUCorridor() {
    const state = getState()
    const building = state.buildings.find((b) => b.id === state.activeBuildingId)
    const bounds = building ? buildingRect(building.site) : undefined
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        corridor: createMildUCorridor(bounds),
      })),
    )
    setDraftCorridor([])
    setTool('select')
  }

  function clearCorridor() {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({ ...floor, corridor: [] })),
    )
    setDraftCorridor([])
  }

  function commitDraftCorridor() {
    const draftCorridor = deps.getDraftCorridor()
    if (draftCorridor.length < 2) {
      return
    }
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        corridor: draftCorridor,
      })),
    )
    setDraftCorridor([])
    setTool('select')
  }

  function addCorridorPoint(point: Point) {
    setDraftCorridor((prev) => [...prev, point])
  }

  function moveCorridorPoint(index: number, point: Point) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        corridor: floor.corridor.map((p, i) => (i === index ? point : p)),
      })),
    )
  }

  return {
    insertUCorridor,
    clearCorridor,
    commitDraftCorridor,
    addCorridorPoint,
    moveCorridorPoint,
  }
}
