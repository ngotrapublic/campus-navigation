import type { Wall } from '../../types'

type WallPropertiesProps = {
  selectedWall: Wall
  metersToPx: number
  updateWall: (wallId: string, patch: Partial<Wall>) => void
  removeWall: (wallId: string) => void
}

export function WallProperties({
  selectedWall,
  metersToPx,
  updateWall,
  removeWall,
}: WallPropertiesProps) {
  return (
    <div className="stack">
      <p>Wall</p>
      <p className="hint">Same controls as rooms: drag, resize handles, delete.</p>
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={0.05}
            step={0.05}
            value={Number((selectedWall.width / metersToPx).toFixed(2))}
            onChange={(event) =>
              updateWall(selectedWall.id, {
                width: Math.max(8, (Number(event.target.value) || 0.2) * metersToPx),
              })
            }
          />
        </label>
        <label>
          Height (m)
          <input
            className="text-input"
            type="number"
            min={0.05}
            step={0.05}
            value={Number((selectedWall.height / metersToPx).toFixed(2))}
            onChange={(event) =>
              updateWall(selectedWall.id, {
                height: Math.max(8, (Number(event.target.value) || 0.2) * metersToPx),
              })
            }
          />
        </label>
      </div>
      <button
        type="button"
        className="tool danger"
        onClick={() => removeWall(selectedWall.id)}
      >
        Delete wall
      </button>
    </div>
  )
}
