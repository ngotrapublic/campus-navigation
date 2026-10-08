import { createId } from '../../lib/id'
import type { QrMarker } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createQrActions(deps: ActionDeps) {
  const { setState, setSelected, setTool } = deps

  function addQrMarker(marker: Omit<QrMarker, 'id'>) {
    const id = createId('qr')
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        qrMarkers: [...floor.qrMarkers, { ...marker, id }],
      })),
    )
    setSelected({ type: 'qr', id })
    setTool('select')
  }

  function updateQrMarker(markerId: string, patch: Partial<QrMarker>) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        qrMarkers: floor.qrMarkers.map((marker) =>
          marker.id === markerId ? { ...marker, ...patch } : marker,
        ),
      })),
    )
  }

  return { addQrMarker, updateQrMarker }
}
