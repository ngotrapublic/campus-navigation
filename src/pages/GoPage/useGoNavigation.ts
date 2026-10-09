import { useEffect, useMemo, useState } from 'react'
import type { AppState, Building, Floor, Point } from '../../types'
import { fetchCampusState } from '../../lib/liveState'
import {
  buildRoute,
  listDestinations,
  type NavRoute,
  type RouteDestination,
} from '../../lib/route'
import { normalizeSite } from '../../lib/site'

function readQuery() {
  const params = new URLSearchParams(window.location.search)
  const xRaw = params.get('x')
  const yRaw = params.get('y')
  const x = xRaw === null ? null : Number(xRaw)
  const y = yRaw === null ? null : Number(yRaw)
  return {
    buildingId: params.get('b') ?? '',
    markerId: params.get('q') ?? '',
    floorId: params.get('f') ?? '',
    label: params.get('n') ?? '',
    x: x !== null && Number.isFinite(x) ? x : null,
    y: y !== null && Number.isFinite(y) ? y : null,
  }
}

export function useGoNavigation() {
  const query = useMemo(() => readQuery(), [])
  const [state, setState] = useState<AppState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [destId, setDestId] = useState('')
  const [activeLeg, setActiveLeg] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const next = await fetchCampusState()
        if (!cancelled) {
          setState(next)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map')
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const building: Building | null = useMemo(() => {
    if (!state) {
      return null
    }
    const found =
      state.buildings.find((item) => item.id === query.buildingId) ?? null
    if (!found) {
      return null
    }
    return {
      ...found,
      site: normalizeSite(found.site),
      elevators: found.elevators ?? [],
      emergencyExits: found.emergencyExits ?? [],
    }
  }, [state, query.buildingId])

  const start = useMemo(() => {
    if (!building) {
      return null
    }
    for (const floor of building.floors) {
      const marker = floor.qrMarkers.find((item) => item.id === query.markerId)
      if (marker) {
        return {
          floor,
          point: { x: marker.x, y: marker.y } as Point,
          label: marker.label,
        }
      }
    }
    if (
      query.floorId &&
      query.x !== null &&
      query.y !== null
    ) {
      const floor = building.floors.find((item) => item.id === query.floorId)
      if (floor) {
        return {
          floor,
          point: { x: query.x, y: query.y } as Point,
          label: query.label || query.markerId || 'QR',
        }
      }
    }
    return null
  }, [building, query])

  const destinations = useMemo(
    () => (building ? listDestinations(building) : []),
    [building],
  )

  const destination: RouteDestination | null = useMemo(() => {
    if (!destId) {
      return null
    }
    return destinations.find((item) => `${item.type}:${item.id}` === destId) ?? null
  }, [destId, destinations])

  const route: NavRoute | null = useMemo(() => {
    if (!building || !start || !destination) {
      return null
    }
    return buildRoute(building, start.floor.id, start.point, destination)
  }, [building, start, destination])

  useEffect(() => {
    setActiveLeg(0)
  }, [route?.summary])

  const viewFloor: Floor | null = useMemo(() => {
    if (!building || !route) {
      return start?.floor ?? null
    }
    const leg = route.legs[activeLeg]
    return building.floors.find((floor) => floor.id === leg?.floorId) ?? null
  }, [building, route, activeLeg, start])

  const legPoints = route?.legs[activeLeg]?.points ?? []

  return {
    error,
    state,
    building,
    start,
    destinations,
    destId,
    setDestId,
    route,
    activeLeg,
    setActiveLeg,
    viewFloor,
    legPoints,
  }
}
