import type { DoorSide, YardDoor } from '../../types'

type YardDoorPropertiesProps = {
  yardDoor: YardDoor
  updateYardDoor: (doorId: string, patch: Partial<YardDoor>) => void
  removeYardDoor: (doorId: string) => void
}

export function YardDoorProperties({
  yardDoor,
  updateYardDoor,
  removeYardDoor,
}: YardDoorPropertiesProps) {
  return (
    <div className="stack">
      <p className="hint">
        Yard door for this floor — used when yard links the two lowest floors.
        Routing picks the nearest door.
      </p>
      <label>
        Label
        <input
          className="text-input"
          value={yardDoor.label}
          onChange={(event) =>
            updateYardDoor(yardDoor.id, { label: event.target.value })
          }
        />
      </label>
      <label>
        Door side
        <select
          className="text-input"
          value={yardDoor.doorSide ?? ''}
          onChange={(event) =>
            updateYardDoor(yardDoor.id, {
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
      <button
        type="button"
        className="tool danger"
        onClick={() => removeYardDoor(yardDoor.id)}
      >
        Delete yard door
      </button>
    </div>
  )
}
