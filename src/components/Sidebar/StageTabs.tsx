import type { EditorStage } from '../../types'

type StageTabsProps = {
  editorStage: EditorStage
  backToSite: () => void
  enterInterior: () => void
}

export function StageTabs({ editorStage, backToSite, enterInterior }: StageTabsProps) {
  return (
    <div className="stage-tabs">
      <button
        type="button"
        className={editorStage === 'site' ? 'stage-tab active' : 'stage-tab'}
        onClick={backToSite}
      >
        1. Site
      </button>
      <button
        type="button"
        className={editorStage === 'interior' ? 'stage-tab active' : 'stage-tab'}
        onClick={enterInterior}
      >
        2. Inside building
      </button>
    </div>
  )
}
