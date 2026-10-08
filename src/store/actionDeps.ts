import type { Dispatch, SetStateAction } from 'react'
import type {
  AppState,
  EditorStage,
  EditorTool,
  Floor,
  Point,
  SelectedEntity,
} from '../types'
import type { SymmetryAxis } from '../lib/mirror'

export type SetState = Dispatch<SetStateAction<AppState>>

export type ActionDeps = {
  setState: SetState
  setEditorStage: Dispatch<SetStateAction<EditorStage>>
  setTool: Dispatch<SetStateAction<EditorTool>>
  setSelected: Dispatch<SetStateAction<SelectedEntity>>
  setDraftCorridor: Dispatch<SetStateAction<Point[]>>
  getState: () => AppState
  getSelected: () => SelectedEntity
  getActiveFloor: () => Floor | null
  getSymmetryAxis: () => SymmetryAxis
  getDraftCorridor: () => Point[]
}
