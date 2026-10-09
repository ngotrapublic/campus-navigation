import { useEffect, useMemo, useState } from 'react'
import type { SnapGuide } from '../../lib/snap'
import type { CampusStore } from '../../store/useCampusStore'
import type { DragState } from './types'
import { createPointerDown } from './canvasPointerDown'
import { createPointerMove, createPointerUp } from './canvasPointerMove'
import type { Rect } from '../../types'
import type { BuildingSite } from '../../types'
import type { Floor } from '../../types'
import type { Elevator, EmergencyExit } from '../../types'

type UseCanvasPointerArgs = {
  store: CampusStore
  svgRef: React.RefObject<SVGSVGElement | null>
  view: Rect
  isInterior: boolean
  site: BuildingSite
  building: Rect
  floor: Floor | null
  elevators: Elevator[]
  emergencyExits: EmergencyExit[]
}

export function useCanvasPointer(args: UseCanvasPointerArgs) {
  const { store, svgRef, view, isInterior, site, building, floor, elevators, emergencyExits } =
    args
  const {
    editorStage,
    tool,
    commitDraftCorridor,
    setSelected,
    removeRoom,
    removeWall,
    removePassage,
    removeElevator,
    addElevator,
    addEmergencyExit,
    addCorridorPoint,
    addQrMarker,
    addYardDoor,
    removeYardDoor,
    updateYardDoor,
    updateSite,
    updateRoom,
    updateWall,
    updatePassage,
    updateElevator,
    updateEmergencyExit,
    updateQrMarker,
    moveCorridorPoint,
    addRoom,
    addWall,
    addPassage,
    activeBuilding,
  } = store

  const yardLinkAllowedOnFloor = Boolean(
    activeBuilding?.yardLinkEnabled &&
      floor &&
      [...(activeBuilding.floors ?? [])]
        .sort((a, b) => a.order - b.order)
        .slice(0, 2)
        .some((item) => item.id === floor.id),
  )

  const [drag, setDrag] = useState<DragState>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (editorStage !== 'interior') {
        return
      }
      if (event.key === 'Enter' && tool === 'corridor') {
        commitDraftCorridor()
      }
      if (event.key === 'Escape') {
        setDrag(null)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorStage, tool, commitDraftCorridor, setSelected])

  const downCtx = useMemo(
    () => ({
      svgRef,
      view,
      isInterior,
      site,
      building,
      floor,
      elevators,
      emergencyExits,
      tool,
      setDrag,
      setSelected,
      removeRoom,
      removeWall,
      removePassage,
      removeElevator,
      addElevator,
      addEmergencyExit,
      addCorridorPoint,
      addQrMarker,
      addYardDoor,
      removeYardDoor,
      yardLinkAllowedOnFloor,
      updateSite,
    }),
    [
      svgRef,
      view,
      isInterior,
      site,
      building,
      floor,
      elevators,
      emergencyExits,
      tool,
      setSelected,
      removeRoom,
      removeWall,
      removePassage,
      removeElevator,
      addElevator,
      addEmergencyExit,
      addCorridorPoint,
      addQrMarker,
      addYardDoor,
      removeYardDoor,
      yardLinkAllowedOnFloor,
      updateSite,
    ],
  )

  const moveUpCtx = useMemo(
    () => ({
      svgRef,
      view,
      isInterior,
      site,
      building,
      floor,
      elevators,
      drag,
      setDrag,
      setSnapGuides,
      updateSite,
      updateRoom,
      updateWall,
      updatePassage,
      updateElevator,
      updateEmergencyExit,
      updateYardDoor,
      updateQrMarker,
      moveCorridorPoint,
      addRoom,
      addWall,
      addPassage,
    }),
    [
      svgRef,
      view,
      isInterior,
      site,
      building,
      floor,
      elevators,
      drag,
      updateSite,
      updateRoom,
      updateWall,
      updatePassage,
      updateElevator,
      updateEmergencyExit,
      updateYardDoor,
      updateQrMarker,
      moveCorridorPoint,
      addRoom,
      addWall,
      addPassage,
    ],
  )

  const handlePointerDown = useMemo(() => createPointerDown(downCtx), [downCtx])
  const handlePointerMove = useMemo(
    () => createPointerMove(moveUpCtx),
    [moveUpCtx],
  )
  const handlePointerUp = useMemo(() => createPointerUp(moveUpCtx), [moveUpCtx])

  return {
    drag,
    snapGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
