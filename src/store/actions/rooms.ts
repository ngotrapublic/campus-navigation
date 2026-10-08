import { createId } from '../../lib/id'
import type { Room } from '../../types'
import type { ActionDeps } from '../actionDeps'
import { updateActiveFloor } from '../updateActiveFloor'

export function createRoomActions(deps: ActionDeps) {
  const { setState, setSelected, setTool } = deps

  function addRoom(room: Omit<Room, 'id'>) {
    const id = createId('room')
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        rooms: [...floor.rooms, { ...room, kind: room.kind ?? 'room', id }],
      })),
    )
    setSelected({ type: 'room', id })
    setTool('select')
  }

  function updateRoom(roomId: string, patch: Partial<Room>) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        rooms: floor.rooms.map((room) =>
          room.id === roomId ? { ...room, ...patch } : room,
        ),
      })),
    )
  }

  function removeRoom(roomId: string) {
    setState((prev) =>
      updateActiveFloor(prev, (floor) => ({
        ...floor,
        rooms: floor.rooms.filter((room) => room.id !== roomId),
      })),
    )
    setSelected(null)
  }

  return { addRoom, updateRoom, removeRoom }
}
