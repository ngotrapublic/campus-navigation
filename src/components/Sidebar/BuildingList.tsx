import type { AppState, Building } from '../../types'

type BuildingListProps = {
  state: AppState
  activeBuilding: Building | null
  selectBuilding: (buildingId: string) => void
  onAddBuilding: () => void
  onRenameBuilding: () => void
}

export function BuildingList({
  state,
  activeBuilding,
  selectBuilding,
  onAddBuilding,
  onRenameBuilding,
}: BuildingListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Buildings</h2>
        <button type="button" className="ghost compact" onClick={onAddBuilding}>
          + Add
        </button>
      </div>
      <ul className="list">
        {state.buildings.map((building) => (
          <li key={building.id}>
            <button
              type="button"
              className={
                building.id === state.activeBuildingId
                  ? 'list-item active'
                  : 'list-item'
              }
              onClick={() => selectBuilding(building.id)}
            >
              <span>{building.name}</span>
              <small>{building.location || 'No location'}</small>
            </button>
          </li>
        ))}
      </ul>
      {activeBuilding ? (
        <button type="button" className="ghost" onClick={onRenameBuilding}>
          Edit building
        </button>
      ) : null}
    </section>
  )
}
