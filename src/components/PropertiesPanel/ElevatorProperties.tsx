import type { DoorSide, Elevator } from '../../types'

type ElevatorPropertiesProps = {
  selectedElevator: Elevator
  metersToPx: number
  updateElevator: (elevatorId: string, patch: Partial<Elevator>) => void
  removeElevator: (elevatorId: string) => void
}

export function ElevatorProperties({
  selectedElevator,
  metersToPx,
  updateElevator,
  removeElevator,
}: ElevatorPropertiesProps) {
  return (
    <div className="stack">
      <p className="hint">Elevator is shared across all floors in this building.</p>
      <label>
        Label
        <input
          className="text-input"
          value={selectedElevator.label}
          onChange={(event) =>
            updateElevator(selectedElevator.id, { label: event.target.value })
          }
        />
      </label>
      <label>
        Side
        <select
          className="text-input"
          value={selectedElevator.side}
          onChange={(event) =>
            updateElevator(selectedElevator.id, {
              side: event.target.value as 'left' | 'right',
            })
          }
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label>
        Door
        <select
          className="text-input"
          value={selectedElevator.doorSide ?? ''}
          onChange={(event) =>
            updateElevator(selectedElevator.id, {
              doorSide: (event.target.value || null) as DoorSide | null,
            })
          }
        >
          <option value="">Not set</option>
          <option value="n">North (top)</option>
          <option value="e">East (right)</option>
          <option value="s">South (bottom)</option>
          <option value="w">West (left)</option>
        </select>
      </label>
      {selectedElevator.doorSide ? (
        <p className="hint">
          Door marker is the entry/exit point for routing to this elevator.
        </p>
      ) : null}
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={0.5}
            step={0.1}
            value={Number(
              ((selectedElevator.width ?? 56) / metersToPx).toFixed(2),
            )}
            onChange={(event) =>
              updateElevator(selectedElevator.id, {
                width: Math.max(
                  24,
                  (Number(event.target.value) || 0.5) * metersToPx,
                ),
              })
            }
          />
        </label>
        <label>
          Height (m)
          <input
            className="text-input"
            type="number"
            min={0.5}
            step={0.1}
            value={Number(
              ((selectedElevator.height ?? 56) / metersToPx).toFixed(2),
            )}
            onChange={(event) =>
              updateElevator(selectedElevator.id, {
                height: Math.max(
                  24,
                  (Number(event.target.value) || 0.5) * metersToPx,
                ),
              })
            }
          />
        </label>
      </div>
      <button
        type="button"
        className="tool danger"
        onClick={() => removeElevator(selectedElevator.id)}
      >
        Delete elevator
      </button>
    </div>
  )
}
