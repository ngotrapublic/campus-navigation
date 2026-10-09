import type { AppState } from '../types'
import { createDefaultState, migrateState } from './storage'

async function readJsonState(url: string): Promise<AppState | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      return null
    }
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return null
    }
    const parsed = (await response.json()) as AppState
    if (!parsed.buildings || !Array.isArray(parsed.buildings)) {
      return null
    }
    return migrateState(parsed)
  } catch {
    return null
  }
}

export async function publishCampusState(state: AppState): Promise<void> {
  try {
    await fetch('/api/campus-state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
  } catch {
    // Studio still works offline from localStorage.
  }
}

export async function fetchCampusState(): Promise<AppState> {
  const fromApi = await readJsonState('/api/campus-state')
  if (fromApi) {
    return fromApi
  }
  const fromPublic = await readJsonState('/campus-state.json')
  if (fromPublic) {
    return fromPublic
  }
  const fromSeedFile = await readJsonState('/campus-navigation-data.json')
  if (fromSeedFile) {
    return fromSeedFile
  }
  return createDefaultState()
}
