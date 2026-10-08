import type { EditorTool } from '../types'
import type { CampusStore } from '../store/useCampusStore'

const TOOLS: { id: EditorTool; label: string; hint: string }[] = [
  { id: 'select', label: 'Select', hint: 'Move / edit' },
  { id: 'corridor', label: 'Corridor', hint: 'Click points · Enter to finish' },
  { id: 'wall', label: 'Wall', hint: 'Solid block' },
  { id: 'passage', label: 'Passage', hint: 'Walkway / lối đi' },
  { id: 'room', label: 'Room', hint: 'Drag to draw' },
  { id: 'open', label: 'Open space', hint: 'Named open area · free walk-through' },
  { id: 'wc_male', label: 'WC Male', hint: 'Drag to draw male WC' },
  { id: 'wc_female', label: 'WC Female', hint: 'Drag to draw female WC' },
  { id: 'elevator', label: 'Elevator', hint: 'Shared for whole building' },
  { id: 'exit', label: 'Exit', hint: 'Emergency exit · shared building' },
  { id: 'qr', label: 'QR point', hint: 'Click to place' },
]

type ToolbarProps = {
  store: CampusStore
}

export function Toolbar({ store }: ToolbarProps) {
  const {
    editorStage,
    tool,
    setTool,
    insertUCorridor,
    clearCorridor,
    commitDraftCorridor,
    draftCorridor,
    deleteSelected,
    selected,
    activeFloor,
    enterInterior,
    backToSite,
    symmetryEnabled,
    setSymmetryEnabled,
    symmetryAxis,
    setSymmetryAxis,
    mirrorActiveFloor,
  } = store

  if (editorStage === 'site') {
    return (
      <div className="toolbar">
        <div className="toolbar-meta">
          <span>
            <strong>Site setup</strong> · Set yard and building sizes, then enter the
            building to add floors
          </span>
        </div>
        <div className="tool-group">
          <button type="button" className="tool primary" onClick={enterInterior}>
            Enter building →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="toolbar">
      <div className="tool-group">
        <button type="button" className="tool" onClick={backToSite}>
          ← Site
        </button>
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tool === item.id ? 'tool active' : 'tool'}
            title={item.hint}
            onClick={() => setTool(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="tool-group">
        <button type="button" className="tool" onClick={insertUCorridor}>
          Insert U corridor
        </button>
        <button type="button" className="tool" onClick={clearCorridor}>
          Clear corridor
        </button>
        {tool === 'corridor' && draftCorridor.length >= 2 ? (
          <button type="button" className="tool primary" onClick={commitDraftCorridor}>
            Finish corridor ({draftCorridor.length})
          </button>
        ) : null}
        {selected ? (
          <button type="button" className="tool danger" onClick={deleteSelected}>
            Delete
          </button>
        ) : null}
      </div>

      <div className="tool-group">
        <button
          type="button"
          className={symmetryEnabled ? 'tool active' : 'tool'}
          title="Show building center line"
          onClick={() => setSymmetryEnabled(!symmetryEnabled)}
        >
          Midline
        </button>
        <button
          type="button"
          className={symmetryAxis === 'vertical' ? 'tool active' : 'tool'}
          disabled={!symmetryEnabled}
          onClick={() => setSymmetryAxis('vertical')}
        >
          Left / Right
        </button>
        <button
          type="button"
          className={symmetryAxis === 'horizontal' ? 'tool active' : 'tool'}
          disabled={!symmetryEnabled}
          onClick={() => setSymmetryAxis('horizontal')}
        >
          Top / Bottom
        </button>
        <button
          type="button"
          className="tool primary"
          disabled={!symmetryEnabled || !activeFloor}
          title="Mirror source side across the center line"
          onClick={() => {
            if (
              window.confirm(
                symmetryAxis === 'vertical'
                  ? 'Mirror left side to the right across the center line?'
                  : 'Mirror top side to the bottom across the center line?',
              )
            ) {
              mirrorActiveFloor()
            }
          }}
        >
          Mirror
        </button>
      </div>

      <div className="toolbar-meta">
        {activeFloor ? (
          <span>
            Inside building · Floor <strong>{activeFloor.name}</strong>
            {' · '}
            {activeFloor.rooms.length} rooms
            {' · '}
            {activeFloor.qrMarkers.length} QR
            {symmetryEnabled
              ? symmetryAxis === 'vertical'
                ? ' · symmetry L→R'
                : ' · symmetry T→B'
              : ''}
          </span>
        ) : (
          <span>Inside building · Add or select a floor to draw</span>
        )}
      </div>
    </div>
  )
}
