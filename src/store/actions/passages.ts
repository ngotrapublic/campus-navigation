import { createId } from '../../lib/id'
import type { Passage } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createPassageActions(deps: ActionDeps) {
  const { setState, setSelected, setTool } = deps

  function addPassage(passage: Omit<Passage, 'id'>) {
    const id = createId('path')
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        passages: [...(floor.passages ?? []), { ...passage, id }],
      })),
    )
    setSelected({ type: 'passage', id })
    setTool('select')
  }

  function updatePassage(passageId: string, patch: Partial<Passage>) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        passages: (floor.passages ?? []).map((passage) =>
          passage.id === passageId ? { ...passage, ...patch } : passage,
        ),
      })),
    )
  }

  function removePassage(passageId: string) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        passages: (floor.passages ?? []).filter(
          (passage) => passage.id !== passageId,
        ),
      })),
    )
    setSelected(null)
  }

  return { addPassage, updatePassage, removePassage }
}
