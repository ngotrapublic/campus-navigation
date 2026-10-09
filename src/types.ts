export type Point = {
  x: number
  y: number
}

export type RoomKind = 'room' | 'open' | 'wc_male' | 'wc_female'

export type DoorSide = 'n' | 'e' | 's' | 'w'

export type Room = {
  id: string
  kind: RoomKind
  name: string
  code: string
  x: number
  y: number
  width: number
  height: number
  doorSide: DoorSide | null
  doorAlong: number
}

export type Wall = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export type Passage = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export type Elevator = {
  id: string
  side: 'left' | 'right'
  x: number
  y: number
  width: number
  height: number
  label: string
  doorSide: DoorSide | null
}

export type EmergencyExit = {
  id: string
  x: number
  y: number
  label: string
}

export type QrMarker = {
  id: string
  label: string
  x: number
  y: number
}

export type YardDoor = {
  id: string
  x: number
  y: number
  doorSide: DoorSide | null
  label: string
}

export type Floor = {
  id: string
  name: string
  order: number
  corridor: Point[]
  rooms: Room[]
  walls: Wall[]
  passages: Passage[]
  qrMarkers: QrMarker[]
  yardDoors: YardDoor[]
}

export type BuildingSite = {
  splitAxis: 'horizontal' | 'vertical'
  yardFirst: boolean
  yardWidthM: number
  yardHeightM: number
  buildingWidthM: number
  buildingHeightM: number
}

export type Building = {
  id: string
  name: string
  location: string
  site: BuildingSite
  yardLinkEnabled: boolean
  elevators: Elevator[]
  emergencyExits: EmergencyExit[]
  floors: Floor[]
}

export type AppSettings = {
  baseUrl: string
}

export type AppState = {
  settings: AppSettings
  buildings: Building[]
  activeBuildingId: string | null
  activeFloorId: string | null
}

export type EditorStage = 'site' | 'interior'

export type EditorTool =
  | 'select'
  | 'pan'
  | 'corridor'
  | 'room'
  | 'open'
  | 'wc_male'
  | 'wc_female'
  | 'wall'
  | 'passage'
  | 'elevator'
  | 'exit'
  | 'yard_door'
  | 'qr'

export type SelectedEntity =
  | { type: 'room'; id: string }
  | { type: 'wall'; id: string }
  | { type: 'passage'; id: string }
  | { type: 'elevator'; id: string }
  | { type: 'exit'; id: string }
  | { type: 'yard-door'; id: string }
  | { type: 'qr'; id: string }
  | { type: 'corridor-point'; index: number }
  | null

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export const CANVAS_WIDTH = 1200
export const CANVAS_HEIGHT = 800

export const DEFAULT_SITE: BuildingSite = {
  splitAxis: 'horizontal',
  yardFirst: true,
  yardWidthM: 80,
  yardHeightM: 20,
  buildingWidthM: 80,
  buildingHeightM: 40,
}

export const MIN_ZONE_M = 1

export const ROOM_KIND_PRESETS: Record<
  RoomKind,
  { name: string; codePrefix: string }
> = {
  room: { name: 'Room', codePrefix: '' },
  open: { name: 'Open space', codePrefix: 'OS' },
  wc_male: { name: 'WC Male', codePrefix: 'WC-M' },
  wc_female: { name: 'WC Female', codePrefix: 'WC-F' },
}
