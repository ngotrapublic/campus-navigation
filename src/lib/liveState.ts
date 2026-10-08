import type { AppState } from '../types'

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
  const response = await fetch('/api/campus-state', {
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(
      'Map not published yet. Open Map Studio on the laptop first so it syncs.',
    )
  }
  return (await response.json()) as AppState
}
