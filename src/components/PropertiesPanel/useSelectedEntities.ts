import type { CampusStore } from '../../store/useCampusStore'

export function useSelectedEntities(store: CampusStore) {
  const { selected, activeBuilding, activeFloor } = store

  const selectedRoom =
    selected?.type === 'room'
      ? activeFloor?.rooms.find((room) => room.id === selected.id)
      : null
  const selectedWall =
    selected?.type === 'wall'
      ? activeFloor?.walls?.find((wall) => wall.id === selected.id)
      : null
  const selectedPassage =
    selected?.type === 'passage'
      ? activeFloor?.passages?.find((passage) => passage.id === selected.id)
      : null
  const selectedElevator =
    selected?.type === 'elevator'
      ? activeBuilding?.elevators?.find((elevator) => elevator.id === selected.id)
      : null
  const selectedExit =
    selected?.type === 'exit'
      ? activeBuilding?.emergencyExits?.find((exit) => exit.id === selected.id)
      : null
  const selectedQr =
    selected?.type === 'qr'
      ? activeFloor?.qrMarkers.find((marker) => marker.id === selected.id)
      : null

  return {
    selectedRoom,
    selectedWall,
    selectedPassage,
    selectedElevator,
    selectedExit,
    selectedQr,
  }
}
