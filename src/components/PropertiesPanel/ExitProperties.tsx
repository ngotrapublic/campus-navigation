import type { EmergencyExit } from '../../types'

type ExitPropertiesProps = {
  selectedExit: EmergencyExit
  updateEmergencyExit: (exitId: string, patch: Partial<EmergencyExit>) => void
}

export function ExitProperties({
  selectedExit,
  updateEmergencyExit,
}: ExitPropertiesProps) {
  return (
    <div className="stack">
      <p className="hint">
        Emergency exit is shared across all floors in this building.
      </p>
      <label>
        Label
        <input
          className="text-input"
          value={selectedExit.label}
          onChange={(event) =>
            updateEmergencyExit(selectedExit.id, {
              label: event.target.value,
            })
          }
        />
      </label>
    </div>
  )
}
