import type { Point, RoomKind } from '../../types'

export type RouteDestination =
  | { type: 'room'; id: string; label: string; floorId: string }
  | { type: 'wc'; id: 'wc_male' | 'wc_female'; kind: Extract<RoomKind, 'wc_male' | 'wc_female'>; label: string }
  | { type: 'elevator'; id: string; label: string }

export type RouteLeg = {
  floorId: string
  floorName: string
  points: Point[]
  note?: string
}

export type NavRoute = {
  legs: RouteLeg[]
  summary: string
}
