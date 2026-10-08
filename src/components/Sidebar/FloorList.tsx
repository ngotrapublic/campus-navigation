import { useState } from 'react'
import type { AppState, Floor } from '../../types'

type FloorListProps = {
  state: AppState
  floors: Floor[]
  addFloor: (name: string) => void
  selectFloor: (floorId: string) => void
  renameFloor: (floorId: string, name: string) => void
  moveFloor: (floorId: string, direction: 'up' | 'down') => void
  deleteFloor: (floorId: string) => void
  backToSite: () => void
}

export function FloorList({
  state,
  floors,
  addFloor,
  selectFloor,
  renameFloor,
  moveFloor,
  deleteFloor,
  backToSite,
}: FloorListProps) {
  const [newFloorName, setNewFloorName] = useState('')

  function handleAddFloor() {
    const name = newFloorName.trim()
    if (!name) {
      return
    }
    addFloor(name)
    setNewFloorName('')
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Floors</h2>
      </div>
      <p className="hint">Floors apply only inside the building footprint.</p>

      <div className="floor-add">
        <input
          className="text-input"
          value={newFloorName}
          onChange={(event) => setNewFloorName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAddFloor()
            }
          }}
          placeholder="Floor name (e.g. B, G, 4)"
        />
        <button
          type="button"
          className="primary"
          onClick={handleAddFloor}
          disabled={!newFloorName.trim()}
        >
          Add floor
        </button>
      </div>

      <ul className="floor-list">
        {floors.map((floor, index) => {
          const isActive = floor.id === state.activeFloorId
          return (
            <li
              key={floor.id}
              className={isActive ? 'floor-row active' : 'floor-row'}
            >
              <button
                type="button"
                className="floor-order"
                title="Select floor"
                onClick={() => selectFloor(floor.id)}
              >
                {index + 1}
              </button>
              <input
                className="floor-name-input"
                value={floor.name}
                onFocus={() => selectFloor(floor.id)}
                onChange={(event) => renameFloor(floor.id, event.target.value)}
                aria-label={`Floor name ${floor.name}`}
              />
              <div className="floor-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Move up"
                  disabled={index === 0}
                  onClick={() => moveFloor(floor.id, 'up')}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Move down"
                  disabled={index === floors.length - 1}
                  onClick={() => moveFloor(floor.id, 'down')}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  title="Delete floor"
                  onClick={() => {
                    const label = floor.name.trim() || `floor ${index + 1}`
                    if (
                      window.confirm(
                        `Delete ${label}? This removes rooms, walls, passages, and QR markers on that floor.`,
                      )
                    ) {
                      deleteFloor(floor.id)
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {floors.length === 0 ? (
        <p className="hint">No floors yet. Add one above.</p>
      ) : (
        <p className="hint">↑↓ to reorder. Edit the name inline.</p>
      )}

      <button type="button" className="ghost" onClick={backToSite}>
        ← Back to site setup
      </button>
    </section>
  )
}
