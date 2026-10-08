import type { Building, Floor } from '../../types'

type FloorSummaryProps = {
  activeFloor: Floor
  activeBuilding: Building | null
}

export function FloorSummary({ activeFloor, activeBuilding }: FloorSummaryProps) {
  return (
    <section className="panel quiet">
      <h3>Floor summary</h3>
      <ul className="summary-list">
        <li>Corridor points: {activeFloor.corridor.length}</li>
        <li>Rooms: {activeFloor.rooms.length}</li>
        <li>Walls: {activeFloor.walls?.length ?? 0}</li>
        <li>Passages: {activeFloor.passages?.length ?? 0}</li>
        <li>QR markers: {activeFloor.qrMarkers.length}</li>
        <li>
          Building elevators: {activeBuilding?.elevators?.length ?? 0} (shared)
        </li>
        <li>
          Emergency exits: {activeBuilding?.emergencyExits?.length ?? 0}{' '}
          (shared)
        </li>
      </ul>
    </section>
  )
}
