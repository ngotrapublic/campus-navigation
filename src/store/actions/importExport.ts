import { exportStateJson, importStateJson } from '../../lib/storage'
import type { ActionDeps } from '../actionDeps'

export function createImportExportActions(deps: ActionDeps) {
  const { setState, setSelected, setDraftCorridor, getState } = deps

  function downloadExport() {
    const state = getState()
    const blob = new Blob([exportStateJson(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'campus-navigation-data.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function uploadImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = importStateJson(String(reader.result))
        setState(next)
        setSelected(null)
        setDraftCorridor([])
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : 'Failed to import file',
        )
      }
    }
    reader.readAsText(file)
  }

  return { downloadExport, uploadImport }
}
