import type { Passage } from '../../types'

type PassagePropertiesProps = {
  selectedPassage: Passage
  metersToPx: number
  updatePassage: (passageId: string, patch: Partial<Passage>) => void
  removePassage: (passageId: string) => void
}

export function PassageProperties({
  selectedPassage,
  metersToPx,
  updatePassage,
  removePassage,
}: PassagePropertiesProps) {
  return (
    <div className="stack">
      <p>Passage</p>
      <p className="hint">Walkway / lối đi — same controls as wall and room.</p>
      <div className="site-grid">
        <label>
          Width (m)
          <input
            className="text-input"
            type="number"
            min={0.05}
            step={0.05}
            value={Number((selectedPassage.width / metersToPx).toFixed(2))}
            onChange={(event) =>
              updatePassage(selectedPassage.id, {
                width: Math.max(
                  16,
                  (Number(event.target.value) || 1) * metersToPx,
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
            min={0.05}
            step={0.05}
            value={Number((selectedPassage.height / metersToPx).toFixed(2))}
            onChange={(event) =>
              updatePassage(selectedPassage.id, {
                height: Math.max(
                  16,
                  (Number(event.target.value) || 1) * metersToPx,
                ),
              })
            }
          />
        </label>
      </div>
      <button
        type="button"
        className="tool danger"
        onClick={() => removePassage(selectedPassage.id)}
      >
        Delete passage
      </button>
    </div>
  )
}
