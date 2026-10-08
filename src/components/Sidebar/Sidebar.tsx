import { useMemo } from 'react'
import type { CampusStore } from '../../store/useCampusStore'
import { siteAreas } from '../../lib/site'
import { BuildingList } from './BuildingList'
import { StageTabs } from './StageTabs'
import { SiteSetup } from './SiteSetup'
import { FloorList } from './FloorList'
import { QrBaseUrl } from './QrBaseUrl'
import { DataPanel } from './DataPanel'

type SidebarProps = {
  store: CampusStore
}

export function Sidebar({ store }: SidebarProps) {
  const {
    state,
    editorStage,
    activeBuilding,
    selectBuilding,
    selectFloor,
    enterInterior,
    backToSite,
    addBuilding,
    renameBuilding,
    updateSite,
    addFloor,
    renameFloor,
    moveFloor,
    deleteFloor,
    downloadExport,
    uploadImport,
    setBaseUrl,
  } = store

  const floors = useMemo(() => {
    if (!activeBuilding) {
      return []
    }
    return [...activeBuilding.floors].sort((a, b) => a.order - b.order)
  }, [activeBuilding])

  const areas = useMemo(() => {
    if (!activeBuilding) {
      return null
    }
    return siteAreas(activeBuilding.site)
  }, [activeBuilding])

  function handleAddBuilding() {
    const name = window.prompt('Building name', 'New Building')
    if (!name?.trim()) {
      return
    }
    const location = window.prompt('Location / campus', 'Campus B') ?? ''
    addBuilding(name.trim(), location.trim())
  }

  function handleRenameBuilding() {
    if (!activeBuilding) {
      return
    }
    const name = window.prompt('Building name', activeBuilding.name)
    if (!name?.trim()) {
      return
    }
    const location = window.prompt('Location / campus', activeBuilding.location)
    if (location === null) {
      return
    }
    renameBuilding(activeBuilding.id, name.trim(), location.trim())
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="eyebrow">Campus Nav</p>
        <h1>Map Studio</h1>
        <p className="muted">Draw floors · place QR · scale buildings</p>
      </div>

      <BuildingList
        state={state}
        activeBuilding={activeBuilding}
        selectBuilding={selectBuilding}
        onAddBuilding={handleAddBuilding}
        onRenameBuilding={handleRenameBuilding}
      />

      {activeBuilding ? (
        <StageTabs
          editorStage={editorStage}
          backToSite={backToSite}
          enterInterior={enterInterior}
        />
      ) : null}

      {activeBuilding && editorStage === 'site' ? (
        <SiteSetup
          activeBuilding={activeBuilding}
          areas={areas}
          updateSite={updateSite}
          enterInterior={enterInterior}
        />
      ) : null}

      {activeBuilding && editorStage === 'interior' ? (
        <FloorList
          state={state}
          floors={floors}
          addFloor={addFloor}
          selectFloor={selectFloor}
          renameFloor={renameFloor}
          moveFloor={moveFloor}
          deleteFloor={deleteFloor}
          backToSite={backToSite}
        />
      ) : null}

      <QrBaseUrl baseUrl={state.settings.baseUrl} setBaseUrl={setBaseUrl} />

      <DataPanel downloadExport={downloadExport} uploadImport={uploadImport} />
    </aside>
  )
}
