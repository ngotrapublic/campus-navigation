import type { AppState, Building, Elevator, Floor } from '../types'
import { DEFAULT_SITE } from '../types'
import seedData from '../../campus-navigation-data.json'
import { normalizeElevator } from './elevators'
import { createId } from './id'
import { normalizeRoom } from './rooms'
import { normalizeSite } from './site'
import { normalizePassage } from './passages'
import { normalizeWall } from './walls'
import { normalizeYardDoors } from './yardLink'

const STORAGE_KEY = 'campus-navigation-v11'

export function createEmptyFloor(name: string, order: number): Floor {
  return {
    id: createId('floor'),
    name,
    order,
    corridor: [],
    rooms: [],
    walls: [],
    passages: [],
    qrMarkers: [],
    yardDoors: [],
  }
}

export function createBuilding(name: string, location: string): Building {
  return {
    id: createId('bldg'),
    name,
    location,
    site: { ...DEFAULT_SITE },
    yardLinkEnabled: false,
    elevators: [],
    emergencyExits: [],
    floors: [],
  }
}

type LegacyFloor = Floor & { elevators?: Elevator[] }

function migrateFloor(raw: LegacyFloor): Floor {
  return {
    id: raw.id,
    name: raw.name,
    order: raw.order,
    corridor: Array.isArray(raw.corridor) ? raw.corridor : [],
    rooms: Array.isArray(raw.rooms) ? raw.rooms.map(normalizeRoom) : [],
    walls: Array.isArray(raw.walls) ? raw.walls.map(normalizeWall) : [],
    passages: Array.isArray(raw.passages)
      ? raw.passages.map(normalizePassage)
      : [],
    qrMarkers: Array.isArray(raw.qrMarkers) ? raw.qrMarkers : [],
    yardDoors: normalizeYardDoors(raw),
  }
}

type LegacyBuilding = Building & {
  elevators?: Elevator[]
  emergencyExits?: Building['emergencyExits']
  yardLinkEnabled?: boolean
  floors?: LegacyFloor[]
}

function collectElevators(raw: LegacyBuilding): Elevator[] {
  const source =
    Array.isArray(raw.elevators) && raw.elevators.length > 0
      ? raw.elevators
      : (() => {
          const fromFloors: Elevator[] = []
          for (const floor of raw.floors ?? []) {
            if (!Array.isArray(floor.elevators)) {
              continue
            }
            for (const elevator of floor.elevators) {
              const exists = fromFloors.some(
                (item) =>
                  item.id === elevator.id ||
                  (item.side === elevator.side &&
                    Math.hypot(item.x - elevator.x, item.y - elevator.y) < 4),
              )
              if (!exists) {
                fromFloors.push(elevator)
              }
            }
          }
          return fromFloors
        })()
  return source.map((elevator) => normalizeElevator(elevator))
}

function migrateBuilding(raw: LegacyBuilding): Building {
  return {
    id: raw.id,
    name: raw.name,
    location: raw.location,
    site: normalizeSite(raw.site),
    yardLinkEnabled: Boolean(raw.yardLinkEnabled),
    elevators: collectElevators(raw),
    emergencyExits: Array.isArray(raw.emergencyExits) ? raw.emergencyExits : [],
    floors: Array.isArray(raw.floors) ? raw.floors.map(migrateFloor) : [],
  }
}

export function createDefaultState(): AppState {
  return migrateState(seedData as unknown as AppState)
}

export function loadState(): AppState {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem('campus-navigation-v10') ??
      localStorage.getItem('campus-navigation-v9')
    if (!raw) {
      return createDefaultState()
    }
    const parsed = JSON.parse(raw) as AppState
    if (!parsed.buildings?.length) {
      return createDefaultState()
    }
    return migrateState(parsed)
  } catch {
    return createDefaultState()
  }
}

function migrateState(parsed: AppState): AppState {
  const buildings = parsed.buildings.map((building) =>
    migrateBuilding(building as LegacyBuilding),
  )
  return {
    ...parsed,
    buildings,
    activeBuildingId: parsed.activeBuildingId ?? buildings[0]?.id ?? null,
    activeFloorId: parsed.activeFloorId ?? null,
    settings: {
      baseUrl:
        typeof window !== 'undefined'
          ? window.location.origin
          : parsed.settings?.baseUrl || '',
    },
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportStateJson(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importStateJson(json: string): AppState {
  const parsed = JSON.parse(json) as AppState
  if (!parsed.buildings || !Array.isArray(parsed.buildings)) {
    throw new Error('Invalid campus data file')
  }
  return migrateState(parsed)
}
