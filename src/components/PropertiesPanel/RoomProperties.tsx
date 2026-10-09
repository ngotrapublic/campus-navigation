import type { DoorSide, Room, RoomKind } from '../../types'
import { ROOM_KIND_PRESETS } from '../../types'

type RoomPropertiesProps = {
  selectedRoom: Room
  metersToPx: number
  activeFloorName: string | undefined
  updateRoom: (roomId: string, patch: Partial<Room>) => void
  removeRoom: (roomId: string) => void
}

export function RoomProperties({
  selectedRoom,
  metersToPx,
  activeFloorName,
  updateRoom,
  removeRoom,
}: RoomPropertiesProps) {
  return (
    <div className="stack">
      <label>
        Type
        <select
          className="text-input"
          value={selectedRoom.kind ?? 'room'}
          onChange={(event) => {
            const kind = event.target.value as RoomKind
            const preset = ROOM_KIND_PRESETS[kind]
            updateRoom(selectedRoom.id, {
              kind,
              name:
                kind === 'room' || kind === 'open'
                  ? selectedRoom.name
                  : preset.name,
              code:
                kind === 'room' || kind === 'open'
                  ? selectedRoom.code
                  : `${preset.codePrefix}-${activeFloorName ?? ''}`,
              doorSide: kind === 'open' ? null : selectedRoom.doorSide,
            })
          }}
        >
          <option value="room">Room</option>
          <option value="open">Open space</option>
          <option value="wc_male">WC Male</option>
          <option value="wc_female">WC Female</option>
        </select>
      </label>
      {selectedRoom.kind === 'open' ? (
        <p className="hint">
          Named open area — students walk through freely. Used as a landmark,
          not a closed room.
        </p>
      ) : null}
      <label>
        Name
        <input
          className="text-input"
          value={selectedRoom.name}
          onChange={(event) =>
            updateRoom(selectedRoom.id, { name: event.target.value })
          }
        />
      </label>
      <label>
        Code
        <input
          className="text-input"
          value={selectedRoom.code}
          onChange={(event) =>
            updateRoom(selectedRoom.id, { code: event.target.value })
          }
        />
      </label>
      {selectedRoom.kind !== 'open' ? (
        <label>
          Door side
          <select
            className="text-input"
            value={selectedRoom.doorSide ?? ''}
            onChange={(event) =>
              updateRoom(selectedRoom.id, {
                doorSide: (event.target.value || null) as DoorSide | null,
                doorAlong: selectedRoom.doorAlong ?? 0.5,
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
      ) : null}
      {selectedRoom.kind !== 'open' && selectedRoom.doorSide ? (
        <>
          <label>
            Door position on side
            <input
              className="text-input"
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round((selectedRoom.doorAlong ?? 0.5) * 100)}
              onChange={(event) =>
                updateRoom(selectedRoom.id, {
                  doorAlong: Number(event.target.value) / 100,
                })
              }
            />
          </label>
          <p className="hint">
            Drag the door marker on the map, or use the slider, to set the exact
            spot on that wall.
          </p>
        </>
      ) : null}
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={0.5}
            step={0.1}
            value={Number((selectedRoom.width / metersToPx).toFixed(2))}
            onChange={(event) =>
              updateRoom(selectedRoom.id, {
                width: Math.max(28, (Number(event.target.value) || 0.5) * metersToPx),
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
            value={Number((selectedRoom.height / metersToPx).toFixed(2))}
            onChange={(event) =>
              updateRoom(selectedRoom.id, {
                height: Math.max(28, (Number(event.target.value) || 0.5) * metersToPx),
              })
            }
          />
        </label>
      </div>
      <button
        type="button"
        className="tool danger"
        onClick={() => removeRoom(selectedRoom.id)}
      >
        Delete {selectedRoom.kind === 'open' ? 'open space' : 'room'}
      </button>
    </div>
  )
}
